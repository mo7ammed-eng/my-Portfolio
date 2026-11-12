<?php

namespace App\Http\Controllers;

use App\Http\Resources\RequestActivityResource;
use App\Http\Resources\VisitorSessionResource;
use App\Models\RequestActivity;
use App\Models\VisitorSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = VisitorSession::with('user');

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('ip', 'like', "%{$search}%")
                    ->orWhere('session_key', 'like', "%{$search}%")
                    ->orWhere('browser', 'like', "%{$search}%")
                    ->orWhere('os', 'like', "%{$search}%")
                    ->orWhere('country', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($device = $request->query('device')) {
            $query->where('device_type', $device);
        }

        if ($request->query('bots') === '0') {
            $query->where('is_bot', false);
        }

        if ($request->query('active') === '1') {
            $query->where('last_activity_at', '>=', now()->subMinutes(5));
        }

        if ($from = $request->query('from')) {
            $query->where('last_activity_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('last_activity_at', '<=', $to);
        }

        $sessions = $query->orderByDesc('last_activity_at')->paginate((int) $request->query('per_page', 20))->withQueryString();

        return VisitorSessionResource::collection($sessions)->response();
    }

    public function show(string $sessionKey): JsonResponse
    {
        $session = VisitorSession::with('user')->where('session_key', $sessionKey)->firstOrFail();

        $activities = RequestActivity::with('client')
            ->where('visitor_session_id', $session->id)
            ->latest('created_at')
            ->limit(100)
            ->get();

        $pages = RequestActivity::where('visitor_session_id', $session->id)
            ->selectRaw('path, COUNT(*) as views')
            ->whereNotNull('path')
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit(25)
            ->get();

        $sources = RequestActivity::where('visitor_session_id', $session->id)
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->get();

        return response()->json([
            'session' => new VisitorSessionResource($session),
            'activities' => RequestActivityResource::collection($activities),
            'pages' => $pages,
            'sources' => $sources,
            'stats' => [
                'requests' => RequestActivity::where('visitor_session_id', $session->id)->count(),
                'errors' => RequestActivity::where('visitor_session_id', $session->id)->where('is_error', true)->count(),
            ],
        ]);
    }

    public function requests(Request $request): JsonResponse
    {
        $query = RequestActivity::with(['client', 'visitor', 'user']);

        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }

        if ($status = $request->query('status')) {
            if ($status === 'errors') {
                $query->where('is_error', true);
            } elseif (is_numeric($status)) {
                $query->where('status', (int) $status);
            }
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('path', 'like', "%{$search}%")
                    ->orWhere('ip', 'like', "%{$search}%")
                    ->orWhere('client_identifier', 'like', "%{$search}%");
            });
        }

        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', $to);
        }

        $activities = $query->latest('created_at')->paginate((int) $request->query('per_page', 25))->withQueryString();

        return RequestActivityResource::collection($activities)->response();
    }

    public function active(): JsonResponse
    {
        return response()->json([
            'count' => VisitorSession::where('last_activity_at', '>=', now()->subMinutes(5))->count(),
        ]);
    }
}
