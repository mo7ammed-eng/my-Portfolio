<?php

namespace App\Services;

use App\Models\User;
use App\Models\VisitorSession;
use App\Support\UserAgent;
use Illuminate\Http\Request;

class VisitorTracker
{
    public function track(Request $request, ?User $user = null): VisitorSession
    {
        $attribution = app(RequestAttribution::class);
        $key = $attribution->normalizeVisitorId($request->header('X-Visitor-Id'))
            ?? $request->attributes->get('_visitor_key')
            ?? $attribution->fallbackVisitorId($request);

        $request->attributes->set('_visitor_key', $key);

        $ua = UserAgent::parse($request->userAgent());
        $country = $request->header('x-vercel-ip-country') ?: $request->header('cf-ipcountry');
        $city = $request->header('x-vercel-ip-city');

        $session = VisitorSession::firstOrNew(['session_key' => $key]);

        if (! $session->exists) {
            $session->first_seen_at = now();
            $session->pages_count = 0;
            $session->requests_count = 0;
            $session->save();
        }

        $session->forceFill([
            'user_id' => $user?->id ?? $session->user_id,
            'ip' => $request->ip(),
            'country' => $country ?: $session->country,
            'city' => $city ?: $session->city,
            'browser' => $ua['browser'],
            'browser_version' => $ua['browser_version'],
            'os' => $ua['os'],
            'device_type' => $ua['device_type'],
            'user_agent' => $request->userAgent(),
            'is_bot' => $ua['is_bot'],
            'last_activity_at' => now(),
        ])->save();

        VisitorSession::whereKey($session->id)->update([
            'requests_count' => $session->requests_count + 1,
        ]);

        $session->requests_count++;

        return $session;
    }
}
