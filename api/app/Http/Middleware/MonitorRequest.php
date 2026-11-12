<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use App\Models\BlockedUser;
use App\Models\RequestActivity;
use App\Models\SecurityEvent;
use App\Services\RequestAttribution;
use App\Services\SystemLogger;
use App\Services\VisitorTracker;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MonitorRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        $ip = $request->ip();
        $user = $request->user() ?? $request->user('sanctum');

        $blockedIp = BlockedIp::active()->where('ip', $ip)->first();
        if ($blockedIp) {
            if ($blockedIp->isExpired()) {
                $blockedIp->update(['is_active' => false]);
            } else {
                app(SystemLogger::class)->log('warning', 'security', 'Blocked IP attempted access', [
                    'source' => 'ip_block',
                    'ip' => $ip,
                    'http_status' => 403,
                ]);
                SecurityEvent::create([
                    'type' => 'blocked_request',
                    'severity' => 'medium',
                    'description' => 'Blocked IP attempted to access the API.',
                    'ip' => $ip,
                    'user_id' => $user?->id,
                    'metadata' => ['path' => $request->path(), 'method' => $request->method()],
                    'created_at' => now(),
                ]);

                return response()->json(['message' => 'Access denied.'], 403);
            }
        }

        if ($user) {
            $blockedUser = BlockedUser::active()->where('user_id', $user->id)->first();
            if ($blockedUser) {
                if ($blockedUser->isExpired()) {
                    $blockedUser->update(['is_active' => false]);
                } else {
                    app(SystemLogger::class)->log('warning', 'security', 'Blocked user attempted access', [
                        'source' => 'user_block',
                        'user_id' => $user->id,
                        'http_status' => 403,
                    ]);
                    SecurityEvent::create([
                        'type' => 'blocked_request',
                        'severity' => 'medium',
                        'description' => 'Blocked user attempted to access the API.',
                        'ip' => $ip,
                        'user_id' => $user->id,
                        'metadata' => ['path' => $request->path(), 'method' => $request->method()],
                        'created_at' => now(),
                    ]);

                    return response()->json(['message' => 'Your account has been suspended.'], 403);
                }
            }
        }

        $attribution = app(RequestAttribution::class)->resolve($request);
        $session = app(VisitorTracker::class)->track($request, $user);

        $request->attributes->set('_monitor', [
            'start' => $start,
            'attribution' => $attribution,
            'visitor_session_id' => $session->id,
        ]);

        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $data = $request->attributes->get('_monitor');
        if (! $data) {
            return;
        }

        try {
            $duration = (int) round((microtime(true) - $data['start']) * 1000);
            $status = $response->getStatusCode();
            $attribution = $data['attribution'];

            RequestActivity::create([
                'visitor_session_id' => $data['visitor_session_id'],
                'api_client_id' => $attribution['client']?->id,
                'user_id' => ($request->user() ?? $request->user('sanctum'))?->id,
                'source' => $attribution['source'],
                'client_identifier' => $attribution['client_identifier'],
                'method' => $request->method(),
                'endpoint' => '/'.$request->path(),
                'path' => $request->path(),
                'status' => $status,
                'duration_ms' => $duration,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referer' => $request->header('Referer'),
                'is_error' => $status >= 400,
                'created_at' => now(),
            ]);

            if ($request->isMethod('GET') && $status < 400) {
                \App\Models\VisitorSession::whereKey($data['visitor_session_id'])->increment('pages_count');
            }

            if ($status >= 500) {
                app(SystemLogger::class)->log('error', 'api', 'API request failed', [
                    'source' => 'http',
                    'http_status' => $status,
                    'request_url' => $request->fullUrl(),
                    'http_method' => $request->method(),
                    'duration_ms' => $duration,
                ]);
            }
        } catch (\Throwable) {
        }
    }
}
