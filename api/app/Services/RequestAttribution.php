<?php

namespace App\Services;

use App\Models\ApiClient;
use Illuminate\Http\Request;

class RequestAttribution
{
    public function resolve(Request $request): array
    {
        $rawKey = $request->header('X-API-Key');
        $client = null;

        if (is_string($rawKey) && $rawKey !== '') {
            $hash = hash('sha256', $rawKey);
            $client = ApiClient::where('token_hash', $hash)->where('is_active', true)->first();

            if ($client) {
                $allowed = $client->allowed_ips;
                if (is_array($allowed) && count($allowed) > 0 && ! in_array($request->ip(), $allowed, true)) {
                    $client = null;
                } else {
                    $client->forceFill(['last_used_at' => now()])->saveQuietly();
                }
            }
        }

        if ($client) {
            return [
                'source' => $client->type,
                'client' => $client,
                'client_identifier' => $client->name,
            ];
        }

        if ($this->isWebsiteRequest($request)) {
            return [
                'source' => 'website',
                'client' => null,
                'client_identifier' => 'Portfolio Website',
            ];
        }

        if ($request->is('api/github/webhook')) {
            return [
                'source' => 'external_api',
                'client' => null,
                'client_identifier' => 'GitHub Webhook',
            ];
        }

        return [
            'source' => 'unknown',
            'client' => null,
            'client_identifier' => null,
        ];
    }

    private function isWebsiteRequest(Request $request): bool
    {
        $frontendHost = parse_url((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), PHP_URL_HOST);
        $candidates = [$request->header('Origin'), $request->header('Referer')];

        foreach ($candidates as $candidate) {
            if (! $candidate) {
                continue;
            }
            $host = parse_url($candidate, PHP_URL_HOST);
            if ($host && ($host === $frontendHost || $host === 'localhost' || $host === '127.0.0.1')) {
                return true;
            }
        }

        return false;
    }

    public function normalizeVisitorId(?string $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return preg_match('/^[A-Za-z0-9_\-]{8,64}$/', $value) ? $value : null;
    }

    public function fallbackVisitorId(Request $request): string
    {
        return 'anon_'.substr(hash('sha256', $request->ip().'|'.(string) $request->userAgent()), 0, 32);
    }
}
