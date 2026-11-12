<?php

namespace App\Services;

use App\Exceptions\GitHubApiException;
use App\Models\GithubAccount;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GitHubService
{
    public function configured(): bool
    {
        return (bool) (config('github.client_id') && config('github.client_secret'));
    }

    public function account(): ?GithubAccount
    {
        return GithubAccount::where('is_active', true)->latest('connected_at')->first();
    }

    public function token(): ?string
    {
        return $this->account()?->access_token ?: (config('github.token') ?: null);
    }

    public function hasToken(): bool
    {
        return (bool) $this->token();
    }

    public function authorizeUrl(string $state): ?string
    {
        if (! $this->configured()) {
            return null;
        }

        return 'https://github.com/login/oauth/authorize?'.http_build_query([
            'client_id' => config('github.client_id'),
            'redirect_uri' => config('github.redirect_uri'),
            'scope' => 'read:user public_repo',
            'state' => $state,
            'allow_signup' => 'false',
        ]);
    }

    public function exchangeCode(string $code): array
    {
        if (! $this->configured()) {
            throw new GitHubApiException('GitHub OAuth is not configured.', 503);
        }

        $response = Http::asForm()
            ->acceptJson()
            ->timeout(config('github.timeout'))
            ->post('https://github.com/login/oauth/access_token', [
                'client_id' => config('github.client_id'),
                'client_secret' => config('github.client_secret'),
                'code' => $code,
                'redirect_uri' => config('github.redirect_uri'),
            ]);

        if (! $response->ok()) {
            throw new GitHubApiException('GitHub rejected the OAuth code.', $response->status());
        }

        $data = $response->json();
        if (empty($data['access_token'])) {
            throw new GitHubApiException($data['error_description'] ?? 'GitHub did not return an access token.', 422);
        }

        return $data;
    }

    public function revoke(string $token): bool
    {
        if (! $this->configured()) {
            return false;
        }

        $response = Http::withBasicAuth(config('github.client_id'), config('github.client_secret'))
            ->acceptJson()
            ->timeout(config('github.timeout'))
            ->delete('https://api.github.com/applications/'.config('github.client_id').'/token', [
                'access_token' => $token,
            ]);

        return $response->ok() || $response->status() === 404;
    }

    public function user(string $token): array
    {
        return $this->api('/user', token: $token) ?? [];
    }

    public function api(
        string $path,
        array $query = [],
        int $ttl = 0,
        ?string $token = null,
        bool $forceToken = false
    ): ?array {
        $token ??= $this->token();

        if (! $token && $forceToken) {
            throw new GitHubApiException('Connect a GitHub account to access this resource.', 401);
        }

        $path = '/'.ltrim($path, '/');
        $cacheKey = 'github:api:'.sha1($path.'?'.http_build_query($query).'|'.($token ? 'auth' : 'public'));

        $fetch = function () use ($path, $query, $token) {
            $request = Http::acceptJson()
                ->withHeaders([
                    'X-GitHub-Api-Version' => '2022-11-28',
                    'User-Agent' => 'Waleed-Portfolio-Platform',
                ])
                ->timeout(config('github.timeout'));

            if ($token) {
                $request = $request->withToken($token);
            }

            $response = $request->get(rtrim(config('github.api_url'), '/').$path, $query);

            return $this->decode($response);
        };

        if ($ttl > 0) {
            return Cache::remember($cacheKey, now()->addSeconds($ttl), $fetch);
        }

        return $fetch();
    }

    public function repositories(int $page = 1, int $perPage = 100): array
    {
        return $this->api('/user/repos', [
            'per_page' => $perPage,
            'page' => $page,
            'sort' => 'updated',
            'affiliation' => 'owner,collaborator,organization_member',
        ], 0, forceToken: true) ?? [];
    }

    public function repository(string $fullName): ?array
    {
        return $this->api('/repos/'.$this->normalizeFullName($fullName));
    }

    public function languages(string $fullName): array
    {
        return $this->api('/repos/'.$this->normalizeFullName($fullName).'/languages', ttl: 3600) ?? [];
    }

    public function readme(string $fullName, string $ref = 'HEAD'): ?array
    {
        return $this->api('/repos/'.$this->normalizeFullName($fullName).'/readme', ['ref' => $ref]);
    }

    public function contents(string $fullName, string $path = '', string $ref = 'HEAD'): ?array
    {
        $path = ltrim($path, '/');

        return $this->api('/repos/'.$this->normalizeFullName($fullName).'/contents/'.$this->encodePath($path), ['ref' => $ref]);
    }

    public function normalizeFullName(string $fullName): string
    {
        if (! preg_match('#^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$#', $fullName)) {
            throw new GitHubApiException('Invalid repository name.', 422);
        }

        return $fullName;
    }

    public function encodePath(string $path): string
    {
        $segments = array_filter(explode('/', trim($path, '/')), fn ($s) => $s !== '');

        foreach ($segments as $segment) {
            if ($segment === '..' || $segment === '.') {
                throw new GitHubApiException('Invalid repository path.', 422);
            }
        }

        return implode('/', array_map('rawurlencode', $segments));
    }

    private function decode(Response $response): ?array
    {
        if ($response->status() === 404) {
            return null;
        }

        if ($response->status() === 401) {
            throw new GitHubApiException('GitHub credentials are invalid or expired.', 401);
        }

        if (in_array($response->status(), [403, 429], true)) {
            $remaining = $response->header('X-RateLimit-Remaining');
            $reset = $response->header('X-RateLimit-Reset');
            $message = $remaining === '0'
                ? 'GitHub API rate limit reached.'
                : 'GitHub API request was rejected.';

            throw new GitHubApiException($message, $response->status(), $reset ? (int) $reset : null);
        }

        if (! $response->ok()) {
            throw new GitHubApiException('GitHub API error ('.$response->status().').', $response->status());
        }

        return $response->json();
    }

    public function rateLimit(): array
    {
        try {
            return Cache::remember('github:rate:current', now()->addSeconds(60), function () {
                return $this->api('/rate_limit') ?? [];
            });
        } catch (GitHubApiException $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
