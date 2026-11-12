<?php

namespace App\Http\Controllers;

use App\Models\BlockedIp;
use App\Models\BlockedUser;
use App\Models\GithubRepository;
use App\Models\RequestActivity;
use App\Models\SystemLog;
use App\Models\VisitorSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $range = $request->query('range', '7d');
        $days = match ($range) {
            '1d' => 1,
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };

        $from = now()->subDays($days - 1)->startOfDay();
        $activity = RequestActivity::where('created_at', '>=', $from);
        $logs = SystemLog::where('created_at', '>=', $from);

        $requestSeries = $this->dailySeries(
            (clone $activity)->selectRaw('DATE(created_at) as day, COUNT(*) as count')->groupBy('day')->get(),
            $days
        );

        $visitorSeries = $this->dailySeries(
            (clone $activity)
                ->selectRaw('DATE(created_at) as day, COUNT(DISTINCT visitor_session_id) as count')
                ->whereNotNull('visitor_session_id')
                ->groupBy('day')
                ->get(),
            $days
        );

        $errorSeries = $this->dailySeries(
            (clone $logs)
                ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
                ->whereIn('level', ['error', 'critical'])
                ->groupBy('day')
                ->get(),
            $days
        );

        $repositorySeries = $this->dailySeries(
            GithubRepository::where('synced_at', '>=', $from)
                ->selectRaw('DATE(synced_at) as day, COUNT(*) as count')
                ->groupBy('day')
                ->get(),
            $days
        );

        $sources = (clone $activity)
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['source' => $row->source, 'count' => (int) $row->count]);

        $topPages = (clone $activity)
            ->selectRaw('path, COUNT(*) as count')
            ->whereNotNull('path')
            ->groupBy('path')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn ($row) => ['path' => '/'.$row->path, 'count' => (int) $row->count]);

        $recentActivity = RequestActivity::with(['client', 'visitor'])
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'source' => $a->source,
                'client' => $a->client?->name ?? $a->client_identifier,
                'method' => $a->method,
                'path' => '/'.$a->path,
                'status' => $a->status,
                'duration_ms' => $a->duration_ms,
                'ip' => $a->ip,
                'device' => $a->visitor?->device_type,
                'browser' => $a->visitor?->browser,
                'country' => $a->visitor?->country,
                'created_at' => $a->created_at?->toIso8601String(),
            ]);

        $recentLogs = SystemLog::whereIn('level', ['warning', 'error', 'critical'])
            ->latest('created_at')
            ->limit(6)
            ->get(['id', 'uuid', 'level', 'category', 'message', 'source', 'created_at'])
            ->map(fn ($l) => [
                'id' => $l->id,
                'uuid' => $l->uuid,
                'level' => $l->level,
                'category' => $l->category,
                'message' => $l->message,
                'source' => $l->source,
                'created_at' => $l->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'range' => ['days' => $days, 'from' => $from->toIso8601String(), 'to' => now()->toIso8601String()],
            'totals' => [
                'visitors' => VisitorSession::count(),
                'visitors_in_range' => VisitorSession::where('last_activity_at', '>=', $from)->count(),
                'active_sessions' => VisitorSession::where('last_activity_at', '>=', now()->subMinutes(5))->count(),
                'requests' => (clone $activity)->count(),
                'requests_today' => RequestActivity::whereDate('created_at', today())->count(),
                'api_requests' => (clone $activity)->where('source', '!=', 'website')->count(),
                'errors' => (clone $activity)->where('is_error', true)->count(),
                'critical_errors' => (clone $logs)->where('level', 'critical')->count(),
                'published_repositories' => GithubRepository::where('status', 'published')->count(),
                'pending_repositories' => GithubRepository::where('status', 'pending')->count(),
                'hidden_repositories' => GithubRepository::where('status', 'hidden')->count(),
                'blocked_ips' => BlockedIp::active()->count(),
                'blocked_users' => BlockedUser::active()->count(),
            ],
            'charts' => [
                'requests' => $requestSeries,
                'visitors' => $visitorSeries,
                'errors' => $errorSeries,
                'repositories' => $repositorySeries,
                'sources' => $sources,
                'top_pages' => $topPages,
                'repository_statuses' => GithubRepository::selectRaw('status, COUNT(*) as count')
                    ->groupBy('status')
                    ->get()
                    ->map(fn ($r) => ['status' => $r->status, 'count' => (int) $r->count]),
            ],
            'recent_activity' => $recentActivity,
            'recent_logs' => $recentLogs,
        ]);
    }

    private function dailySeries($rows, int $days): array
    {
        $map = [];
        foreach ($rows as $row) {
            $day = is_array($row) ? $row['day'] : $row->day;
            $map[(string) $day] = (int) (is_array($row) ? $row['count'] : $row->count);
        }

        $series = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $series[] = [
                'date' => $date,
                'label' => now()->subDays($i)->format($days <= 7 ? 'D' : 'M j'),
                'count' => $map[$date] ?? 0,
            ];
        }

        return $series;
    }
}
