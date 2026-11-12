<?php

namespace App\Services;

use App\Exceptions\GitHubApiException;
use App\Models\GithubAccount;
use App\Models\GithubRepository;
use App\Models\GithubSyncLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class GitHubSyncService
{
    public function __construct(private GitHubService $github) {}

    public function connect(string $code): GithubAccount
    {
        $tokenData = $this->github->exchangeCode($code);
        $token = $tokenData['access_token'];
        $user = $this->github->user($token);

        GithubAccount::where('is_active', true)->update(['is_active' => false]);

        $account = GithubAccount::updateOrCreate(
            ['github_user_id' => (string) ($user['id'] ?? '')],
            [
                'username' => $user['login'] ?? null,
                'avatar_url' => $user['avatar_url'] ?? null,
                'access_token' => $token,
                'token_type' => $tokenData['token_type'] ?? 'bearer',
                'scopes' => $tokenData['scope'] ?? null,
                'connected_at' => now(),
                'is_active' => true,
            ]
        );

        Cache::flush();

        return $account;
    }

    public function disconnect(): void
    {
        $account = $this->github->account();
        if (! $account) {
            return;
        }

        $token = $account->access_token;
        if ($token) {
            $this->github->revoke($token);
        }

        $account->update(['is_active' => false, 'access_token' => null]);
        Cache::flush();
    }

    public function syncAll(): array
    {
        $synced = 0;
        $created = 0;
        $failed = 0;
        $page = 1;

        do {
            $repositories = $this->github->repositories($page);

            foreach ($repositories as $payload) {
                try {
                    $existing = GithubRepository::where('github_id', $payload['id'])->exists();
                    $this->syncPayload($payload, 'oauth', ! $existing);
                    $synced++;
                    if (! $existing) {
                        $created++;
                    }
                } catch (\Throwable $e) {
                    $failed++;
                    GithubSyncLog::create([
                        'action' => 'sync_all',
                        'status' => 'failed',
                        'message' => $e->getMessage(),
                    ]);
                }
            }

            $page++;
        } while (count($repositories) === 100 && $page <= 5);

        $account = $this->github->account();
        $account?->update(['last_synced_at' => now()]);

        return compact('synced', 'created', 'failed');
    }

    public function syncPayload(array $payload, string $source = 'webhook', bool $fetchExtras = true): GithubRepository
    {
        $repository = GithubRepository::where('github_id', $payload['id'])->first();

        $attributes = $this->map($payload);

        if (! $repository) {
            $repository = new GithubRepository($attributes);
            $repository->status = GithubRepository::STATUS_PENDING;
        } else {
            $repository->fill($attributes);
        }

        $repository->sync_source = $source;
        $repository->synced_at = now();
        $repository->last_sync_error = null;
        $repository->save();

        if ($fetchExtras) {
            $this->hydrate($repository, true, false);
        }

        GithubSyncLog::create([
            'github_repository_id' => $repository->id,
            'action' => 'sync_repository',
            'status' => 'success',
            'message' => 'Repository metadata synchronized.',
            'payload' => ['source' => $source, 'full_name' => $repository->full_name],
        ]);

        return $repository->refresh();
    }

    public function refresh(GithubRepository $repository): GithubRepository
    {
        $payload = $this->github->repository($repository->full_name);
        if (! $payload) {
            $repository->update([
                'last_sync_error' => 'Repository not found on GitHub.',
                'synced_at' => now(),
            ]);

            return $repository;
        }

        return $this->syncPayload($payload, 'manual', true);
    }

    public function import(string $fullName): GithubRepository
    {
        $payload = $this->github->repository($fullName);
        if (! $payload) {
            throw new GitHubApiException('Repository not found or not accessible.', 404);
        }

        return $this->syncPayload($payload, 'import', true);
    }

    public function hydrate(GithubRepository $repository, bool $forceReadme = false, bool $forceLanguages = false): void
    {
        try {
            if ($forceLanguages || $repository->languages === null) {
                $languages = $this->github->languages($repository->full_name);
                if (is_array($languages)) {
                    arsort($languages);
                    $repository->languages = $languages;
                    if (! $repository->language && $languages) {
                        $repository->language = array_key_first($languages);
                    }
                }
            }

            if ($forceReadme || ! $repository->readme_fetched_at || $repository->readme_fetched_at->lt(now()->subHours(6))) {
                $readme = $this->github->readme($repository->full_name, $repository->default_branch);
                if ($readme && ($readme['encoding'] ?? '') === 'base64' && ! empty($readme['content'])) {
                    $repository->readme = Str::limit(base64_decode(str_replace(["\n", "\r"], '', $readme['content'])), 500000);
                }
                $repository->readme_fetched_at = now();
            }

            $repository->save();
        } catch (\Throwable $e) {
            $repository->forceFill(['last_sync_error' => Str::limit($e->getMessage(), 1000)])->save();
        }
    }

    public function tree(GithubRepository $repository, string $path = ''): array
    {
        $this->assertPubliclyVisible($repository);

        $path = trim($path, '/');
        $key = 'github:tree:'.$repository->id.':'.$repository->default_branch.':'.sha1($path);

        return Cache::remember($key, now()->addMinutes(10), function () use ($repository, $path) {
            $contents = $this->github->contents($repository->full_name, $path, $repository->default_branch);

            if (! is_array($contents) || ! array_is_list($contents)) {
                throw new GitHubApiException('The requested path is not a directory.', 422);
            }

            $entries = collect($contents)->map(fn ($entry) => [
                'name' => $entry['name'],
                'path' => $entry['path'],
                'type' => $entry['type'] === 'dir' ? 'dir' : 'file',
                'size' => $entry['size'] ?? 0,
                'sha' => $entry['sha'] ?? null,
            ])->all();

            usort($entries, function (array $a, array $b) {
                if ($a['type'] !== $b['type']) {
                    return $a['type'] === 'dir' ? -1 : 1;
                }

                return strcasecmp($a['name'], $b['name']);
            });

            return [
                'path' => $path,
                'entries' => $entries,
            ];
        });
    }

    public function file(GithubRepository $repository, string $path): array
    {
        $this->assertPubliclyVisible($repository);

        $path = trim($path, '/');
        if ($path === '') {
            throw new GitHubApiException('A file path is required.', 422);
        }

        $key = 'github:file:'.$repository->id.':'.$repository->default_branch.':'.sha1($path);

        return Cache::remember($key, now()->addMinutes(10), function () use ($repository, $path) {
            $file = $this->github->contents($repository->full_name, $path, $repository->default_branch);

            if (! is_array($file) || array_is_list($file)) {
                throw new GitHubApiException('The requested path is not a file.', 422);
            }

            $size = (int) ($file['size'] ?? 0);
            $limit = (int) config('github.max_file_bytes', 524288);

            if ($size > $limit) {
                return [
                    'path' => $file['path'],
                    'name' => $file['name'],
                    'size' => $size,
                    'language' => $this->detectLanguage($file['name']),
                    'binary' => false,
                    'too_large' => true,
                    'content' => null,
                    'html_url' => $file['html_url'] ?? null,
                ];
            }

            $encoded = $file['content'] ?? null;
            $encoding = $file['encoding'] ?? 'base64';
            $content = null;

            if ($encoded && $encoding === 'base64') {
                $content = base64_decode(str_replace(["\n", "\r"], '', $encoded), true);
            }

            $binary = $content === false
                || $content === null
                || str_contains($content, "\0")
                || ! mb_check_encoding($content, 'UTF-8');

            return [
                'path' => $file['path'],
                'name' => $file['name'],
                'size' => $size,
                'language' => $this->detectLanguage($file['name']),
                'binary' => $binary,
                'too_large' => false,
                'content' => $binary ? null : $content,
                'html_url' => $file['html_url'] ?? null,
            ];
        });
    }

    public function assertPubliclyVisible(GithubRepository $repository): void
    {
        if (! $repository->isPubliclyVisible()) {
            throw new GitHubApiException('Repository not found.', 404);
        }
    }

    public function map(array $repo): array
    {
        $visibility = $repo['visibility'] ?? (! empty($repo['private']) ? 'private' : 'public');

        return [
            'github_id' => $repo['id'],
            'name' => $repo['name'],
            'full_name' => $repo['full_name'],
            'owner' => $repo['owner']['login'] ?? Str::before($repo['full_name'], '/'),
            'description' => $repo['description'] ?? null,
            'html_url' => $repo['html_url'],
            'default_branch' => $repo['default_branch'] ?? 'main',
            'visibility' => $visibility,
            'language' => $repo['language'] ?? null,
            'topics' => is_array($repo['topics'] ?? null) ? $repo['topics'] : [],
            'stars' => (int) ($repo['stargazers_count'] ?? 0),
            'forks' => (int) ($repo['forks_count'] ?? 0),
            'open_issues' => (int) ($repo['open_issues_count'] ?? 0),
            'size_kb' => (int) ($repo['size'] ?? 0),
            'is_fork' => (bool) ($repo['fork'] ?? false),
            'is_archived' => (bool) ($repo['archived'] ?? false),
            'github_created_at' => $repo['created_at'] ?? null,
            'github_updated_at' => $repo['updated_at'] ?? null,
            'github_pushed_at' => $repo['pushed_at'] ?? null,
        ];
    }

    public function detectLanguage(string $filename): string
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return match ($ext) {
            'js', 'mjs', 'cjs' => 'javascript',
            'jsx' => 'jsx',
            'ts' => 'typescript',
            'tsx' => 'tsx',
            'php', 'phtml' => 'php',
            'py' => 'python',
            'rb' => 'ruby',
            'go' => 'go',
            'rs' => 'rust',
            'java' => 'java',
            'c', 'h' => 'c',
            'cpp', 'cc', 'cxx', 'hpp' => 'cpp',
            'cs' => 'csharp',
            'html', 'htm', 'vue', 'svelte', 'xml', 'svg' => 'markup',
            'css' => 'css',
            'scss', 'sass' => 'scss',
            'json', 'jsonc' => 'json',
            'md', 'markdown' => 'markdown',
            'yml', 'yaml' => 'yaml',
            'sh', 'bash', 'zsh' => 'bash',
            'sql' => 'sql',
            'dockerfile' => 'docker',
            default => 'text',
        };
    }
}
