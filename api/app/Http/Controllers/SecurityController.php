<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuditLogResource;
use App\Http\Resources\BlockedIpResource;
use App\Http\Resources\BlockedUserResource;
use App\Http\Resources\SecurityEventResource;
use App\Models\AuditLog;
use App\Models\BlockedIp;
use App\Models\BlockedUser;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SecurityController extends Controller
{
    public function summary(): JsonResponse
    {
        $since = now()->subDays(7);

        $byType = SecurityEvent::where('created_at', '>=', $since)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($row) => ['type' => $row->type, 'count' => (int) $row->count]);

        return response()->json([
            'totals' => [
                'blocked_ips' => BlockedIp::active()->count(),
                'blocked_users' => BlockedUser::active()->count(),
                'events_7d' => SecurityEvent::where('created_at', '>=', $since)->count(),
                'critical_events_7d' => SecurityEvent::where('created_at', '>=', $since)->whereIn('severity', ['high', 'critical'])->count(),
                'failed_requests_24h' => DB::table('request_activities')
                    ->where('created_at', '>=', now()->subDay())
                    ->whereIn('status', [401, 403, 429])
                    ->count(),
            ],
            'by_type' => $byType,
            'recent_events' => SecurityEventResource::collection(
                SecurityEvent::with(['user', 'admin'])->latest('created_at')->limit(10)->get()
            ),
        ]);
    }

    public function blockedIps(Request $request): JsonResponse
    {
        $query = BlockedIp::with('blockedBy');

        if ($request->query('state') !== 'all') {
            $request->query('state') === 'inactive' ? $query->where('is_active', false) : $query->active();
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where('ip', 'like', "%{$search}%");
        }

        return BlockedIpResource::collection($query->latest()->paginate(25))->response();
    }

    public function blockIp(Request $request, AuditLogger $audit): JsonResponse
    {
        $validated = $request->validate([
            'ip' => ['required', 'ip'],
            'reason' => ['nullable', 'string', 'max:2000'],
            'is_permanent' => ['sometimes', 'boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $permanent = $validated['is_permanent'] ?? empty($validated['expires_at']);

        $blocked = BlockedIp::updateOrCreate(
            ['ip' => $validated['ip']],
            [
                'reason' => $validated['reason'] ?? null,
                'blocked_by' => $request->user()->id,
                'is_permanent' => $permanent,
                'expires_at' => $permanent ? null : $validated['expires_at'],
                'is_active' => true,
                'unblocked_at' => null,
                'unblocked_by' => null,
            ]
        );

        SecurityEvent::create([
            'type' => 'ip_blocked',
            'severity' => 'medium',
            'description' => 'IP address '.$validated['ip'].' was blocked.',
            'ip' => $validated['ip'],
            'admin_id' => $request->user()->id,
            'metadata' => ['permanent' => $permanent, 'expires_at' => $blocked->expires_at?->toIso8601String()],
            'created_at' => now(),
        ]);

        $audit->record('security.block_ip', 'blocked_ip', (string) $blocked->id, 'Blocked IP '.$validated['ip'], $validated);

        return response()->json(['blocked_ip' => new BlockedIpResource($blocked->load('blockedBy'))], 201);
    }

    public function unblockIp(Request $request, BlockedIp $blockedIp, AuditLogger $audit): JsonResponse
    {
        if (! $blockedIp->is_active) {
            return response()->json(['message' => 'This IP is not currently blocked.'], 422);
        }

        $blockedIp->update([
            'is_active' => false,
            'unblocked_at' => now(),
            'unblocked_by' => $request->user()->id,
        ]);

        SecurityEvent::create([
            'type' => 'ip_unblocked',
            'severity' => 'low',
            'description' => 'IP address '.$blockedIp->ip.' was unblocked.',
            'ip' => $blockedIp->ip,
            'admin_id' => $request->user()->id,
            'created_at' => now(),
        ]);

        $audit->record('security.unblock_ip', 'blocked_ip', (string) $blockedIp->id, 'Unblocked IP '.$blockedIp->ip);

        return response()->json(['blocked_ip' => new BlockedIpResource($blockedIp->fresh('blockedBy'))]);
    }

    public function blockedUsers(Request $request): JsonResponse
    {
        $query = BlockedUser::with(['user', 'blockedBy']);

        if ($request->query('state') !== 'all') {
            $request->query('state') === 'inactive' ? $query->where('is_active', false) : $query->active();
        }

        return BlockedUserResource::collection($query->latest()->paginate(25))->response();
    }

    public function blockUser(Request $request, AuditLogger $audit): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['nullable', 'string', 'max:2000'],
            'is_permanent' => ['sometimes', 'boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        abort_if($validated['user_id'] === $request->user()->id, 422, 'You cannot block your own account.');

        $permanent = $validated['is_permanent'] ?? empty($validated['expires_at']);

        $blocked = BlockedUser::updateOrCreate(
            ['user_id' => $validated['user_id']],
            [
                'reason' => $validated['reason'] ?? null,
                'blocked_by' => $request->user()->id,
                'is_permanent' => $permanent,
                'expires_at' => $permanent ? null : $validated['expires_at'],
                'is_active' => true,
                'unblocked_at' => null,
                'unblocked_by' => null,
            ]
        );

        $user = User::find($validated['user_id']);

        SecurityEvent::create([
            'type' => 'user_blocked',
            'severity' => 'high',
            'description' => 'User '.$user->email.' was blocked.',
            'user_id' => $user->id,
            'admin_id' => $request->user()->id,
            'metadata' => ['permanent' => $permanent],
            'created_at' => now(),
        ]);

        $audit->record('security.block_user', 'user', (string) $user->id, 'Blocked user '.$user->email);

        return response()->json(['blocked_user' => new BlockedUserResource($blocked->load(['user', 'blockedBy']))], 201);
    }

    public function unblockUser(Request $request, BlockedUser $blockedUser, AuditLogger $audit): JsonResponse
    {
        if (! $blockedUser->is_active) {
            return response()->json(['message' => 'This user is not currently blocked.'], 422);
        }

        $blockedUser->update([
            'is_active' => false,
            'unblocked_at' => now(),
            'unblocked_by' => $request->user()->id,
        ]);

        SecurityEvent::create([
            'type' => 'user_unblocked',
            'severity' => 'medium',
            'description' => 'User #'.$blockedUser->user_id.' was unblocked.',
            'user_id' => $blockedUser->user_id,
            'admin_id' => $request->user()->id,
            'created_at' => now(),
        ]);

        $audit->record('security.unblock_user', 'user', (string) $blockedUser->user_id, 'Unblocked user #'.$blockedUser->user_id);

        return response()->json(['blocked_user' => new BlockedUserResource($blockedUser->fresh(['user', 'blockedBy']))]);
    }

    public function events(Request $request): JsonResponse
    {
        $query = SecurityEvent::with(['user', 'admin']);

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($severity = $request->query('severity')) {
            $query->where('severity', $severity);
        }

        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', $to);
        }

        return SecurityEventResource::collection($query->latest('created_at')->paginate(25))->response();
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with('admin');

        if ($action = $request->query('action')) {
            $query->where('action', 'like', "%{$action}%");
        }

        if ($adminId = $request->query('admin_id')) {
            $query->where('admin_id', $adminId);
        }

        if ($target = $request->query('target_type')) {
            $query->where('target_type', $target);
        }

        return AuditLogResource::collection($query->latest('created_at')->paginate(30))->response();
    }
}
