<?php

namespace App\Http\Middleware;

use App\Services\SystemLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            app(SystemLogger::class)->log('warning', 'security', 'Unauthorized admin access attempt', [
                'source' => 'admin_guard',
                'ip' => $request->ip(),
                'http_status' => 403,
                'request_url' => $request->fullUrl(),
            ]);

            return response()->json(['message' => 'Administrator access required.'], 403);
        }

        return $next($request);
    }
}
