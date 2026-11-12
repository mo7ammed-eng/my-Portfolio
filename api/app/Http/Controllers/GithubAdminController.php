<?php

namespace App\Http\Controllers;

use App\Exceptions\GitHubApiException;
use App\Http\Resources\GithubRepositoryResource;
use App\Models\GithubRepository;
use App\Models\GithubSyncLog;
use App\Services\AuditLogger;
use App\Services\GitHubService;
use App\Services\GitHubSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GithubAdminController extends Controller
{
    public function __construct(
        private GitHubService $github,
        private GitHubSyncService $sync,
        private AuditLogger $audit
    ) {}

    public function status(): JsonResponse
    {
        $account = $this->github->account();

        return response()->json([
            'configured' => $this->github->configured(),
            'has_token' => $this->github->hasToken(),
            'account' => $account ? [
                'username' => $account->username,
                'avatar_url' => $account->avatar_url,
                'connected_at' => $account->connected_at?->toIso8601String(),
                'last_synced_at' => $account->last_synced_at?->toIso8601String(),
                'scopes' => $account->scopes,
            ] : null,
            'counts' => [
                'all' => GithubRepository::count(),
                'pending' => GithubRepository::where('status', GithubRepository::STATUS_PENDING)->count(),
                'published' => GithubRepository::where('status', GithubRepository::STATUS_PUBLISHED)->count(),
                'rejected' => GithubRepository::where('status', GithubRepository::STATUS_REJECTED)->count(),
                'hidden' => GithubRepository::where('status', GithubRepository::STATUS_HIDDEN)->count(),
            ],
        ]);
    }

    public function oauthUrl(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'state' => ['required', 'string', 'min:16', 'max:128'],
        ]);

        $url = $this->github->authorizeUrl($validated['state']);
        if (! $url) {
            return response()->json([
                'message' => 'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
            ], 503);
        }

        return response()->json(['url' => $url]);
    }

    public function exchange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:512'],
        ]);

        try {
            $account = $this->sync->connect($validated['code']);
        } catch (GitHubApiException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?: 422);
        }

        $this->audit->record('github.connect', 'github_account', (string) $account->id, 'Connected GitHub account '.$account->username);

        $sync = ['synced' => 0, 'created' => 0, 'failed' => 0];
        $syncError = null;
        try {
            $sync = $this->sync->syncAll();
        } catch (\Throwable $e) {
            $syncError = $e->getMessage();
        }

        return response()->json([
            'account' => [
                'username' => $account->username,
                'avatar_url' => $account->avatar_url,
            ],
            'sync' => $sync,
            'sync_error' => $syncError,
        ]);
    }

    public function disconnect(): JsonResponse
    {
        $account = $this->github->account();
        $this->sync->disconnect();
        $this->audit->record('github.disconnect', 'github_account', $account?->id ? (string) $account->id : null, 'Disconnected GitHub account');

        return response()->json(['success' => true]);
    }

    public function sync(): JsonResponse
    {
        try {
            $result = $this->sync->syncAll();
        } catch (GitHubApiException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?: 422);
        }

        $this->audit->record('github.sync', 'github_repository', null, 'Synchronized all repositories', $result);

        return response()->json(['success' => true, 'sync' => $result]);
    }

    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:191', 'regex:/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/'],
        ]);

        try {
            $repository = $this->sync->import($validated['full_name']);
        } catch (GitHubApiException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?: 422);
        }

        $this->audit->record('github.import', 'github_repository', (string) $repository->id, 'Imported repository '.$repository->full_name);

        return response()->json(['repository' => new GithubRepositoryResource($repository)], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = GithubRepository::query();

        if ($status = $request->query('status')) {
            if (in_array($status, GithubRepository::STATUSES, true)) {
                $query->where('status', $status);
            }
        }

        if ($visibility = $request->query('visibility')) {
            $query->where('visibility', $visibility);
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('language', 'like', "%{$search}%");
            });
        }

        $sort = $request->query('sort', 'display');
        match ($sort) {
            'updated' => $query->orderByDesc('github_pushed_at'),
            'stars' => $query->orderByDesc('stars'),
            'name' => $query->orderBy('name'),
            default => $query->orderBy('display_order')->orderByDesc('is_featured')->orderByDesc('github_pushed_at'),
        };

        $repositories = $query->paginate((int) $request->query('per_page', 20))->withQueryString();

        return GithubRepositoryResource::collection($repositories)->response();
    }

    public function show(GithubRepository $repository): JsonResponse
    {
        $logs = GithubSyncLog::where('github_repository_id', $repository->id)->latest()->limit(10)->get();

        return response()->json([
            'repository' => new GithubRepositoryResource($repository),
            'sync_logs' => $logs,
        ]);
    }

    public function update(Request $request, GithubRepository $repository): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(GithubRepository::STATUSES)],
            'is_featured' => ['sometimes', 'boolean'],
            'display_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'topics' => ['sometimes', 'array', 'max:20'],
            'topics.*' => ['string', 'max:50'],
        ]);

        $previousStatus = $repository->status;
        $repository->fill($validated);
        $repository->save();

        if (isset($validated['status']) && $validated['status'] !== $previousStatus) {
            $this->audit->record('github.status_changed', 'github_repository', (string) $repository->id, "Changed status from {$previousStatus} to {$repository->status}", [
                'from' => $previousStatus,
                'to' => $repository->status,
            ]);
        } else {
            $this->audit->record('github.update', 'github_repository', (string) $repository->id, 'Updated repository metadata', $validated);
        }

        return response()->json([
            'repository' => new GithubRepositoryResource($repository->refresh()),
            'warning' => $repository->status === GithubRepository::STATUS_PUBLISHED && $repository->visibility !== 'public'
                ? 'Private repositories are never shown publicly, even when published.'
                : null,
        ]);
    }

    public function destroy(GithubRepository $repository): JsonResponse
    {
        $fullName = $repository->full_name;
        $this->audit->record('github.delete', 'github_repository', (string) $repository->id, 'Deleted local repository record '.$fullName);
        $repository->delete();

        return response()->json(['success' => true]);
    }

    public function refresh(GithubRepository $repository): JsonResponse
    {
        try {
            $repository = $this->sync->refresh($repository);
        } catch (GitHubApiException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?: 422);
        }

        $this->audit->record('github.refresh', 'github_repository', (string) $repository->id, 'Refreshed repository '.$repository->full_name);

        return response()->json(['repository' => new GithubRepositoryResource($repository)]);
    }

    public function syncLogs(Request $request): JsonResponse
    {
        $logs = GithubSyncLog::with('repository')->latest()->paginate((int) $request->query('per_page', 25));

        return response()->json($logs);
    }
}
