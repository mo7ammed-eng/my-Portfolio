<?php

namespace App\Http\Controllers;

use App\Exceptions\GitHubApiException;
use App\Http\Resources\GithubRepositoryResource;
use App\Models\GithubRepository;
use App\Services\GitHubSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GithubPublicController extends Controller
{
    public function __construct(private GitHubSyncService $sync) {}

    public function index(Request $request): JsonResponse
    {
        $query = GithubRepository::publiclyVisible();

        if ($language = $request->query('language')) {
            $query->where('language', $language);
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('language', 'like', "%{$search}%");
            });
        }

        match ($request->query('sort', 'featured')) {
            'stars' => $query->orderByDesc('stars'),
            'updated' => $query->orderByDesc('github_pushed_at'),
            'name' => $query->orderBy('name'),
            default => $query->orderByDesc('is_featured')->orderBy('display_order')->orderByDesc('github_pushed_at'),
        };

        $repositories = $query->paginate((int) $request->query('per_page', 12))->withQueryString();

        return GithubRepositoryResource::collection($repositories)->response();
    }

    public function show(Request $request, string $owner, string $repo): JsonResponse
    {
        $repository = $this->findPublic($owner, $repo);

        if ($repository->languages === null || ! $repository->readme_fetched_at) {
            $this->sync->hydrate($repository);
            $repository->refresh();
        }

        $request->merge(['with_readme' => true]);

        return response()->json([
            'repository' => new GithubRepositoryResource($repository),
        ]);
    }

    public function tree(Request $request, string $owner, string $repo): JsonResponse
    {
        $repository = $this->findPublic($owner, $repo);

        try {
            $result = $this->sync->tree($repository, (string) $request->query('path', ''));
        } catch (GitHubApiException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?: 422);
        }

        return response()->json($result);
    }

    public function file(Request $request, string $owner, string $repo): JsonResponse
    {
        $repository = $this->findPublic($owner, $repo);
        $path = (string) $request->query('path', '');

        if ($path === '') {
            return response()->json(['message' => 'A file path is required.'], 422);
        }

        try {
            $result = $this->sync->file($repository, $path);
        } catch (GitHubApiException $e) {
            return response()->json(['message' => $e->getMessage()], $e->status ?: 422);
        }

        return response()->json($result);
    }

    public function languages(): JsonResponse
    {
        $languages = GithubRepository::publiclyVisible()
            ->whereNotNull('language')
            ->selectRaw('language, COUNT(*) as count')
            ->groupBy('language')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['language' => $row->language, 'count' => (int) $row->count]);

        return response()->json(['languages' => $languages]);
    }

    private function findPublic(string $owner, string $repo): GithubRepository
    {
        $repository = GithubRepository::where('owner', $owner)
            ->where('name', $repo)
            ->where('status', GithubRepository::STATUS_PUBLISHED)
            ->where('visibility', 'public')
            ->first();

        abort_if(! $repository, 404, 'Repository not found.');

        return $repository;
    }
}
