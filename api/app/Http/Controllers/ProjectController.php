<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    /**
     * Public listing — mirrors the legacy /api/works contract.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Project::with('images')->orderBy('sort_order')->orderByDesc('created_at');

        if ($request->boolean('all') && $request->user()) {
            // admin: include hidden
        } else {
            $query->where('visible', true);
        }

        if ($request->query('category')) {
            $query->where('category', $request->query('category'));
        }

        return ProjectResource::collection($query->get());
    }

    public function store(ProjectRequest $request): JsonResponse
    {
        $data = $this->prepareData($request);

        $project = Project::create($data);
        $this->syncImages($project, $request);

        return (new ProjectResource($project->load('images')))->response()->setStatusCode(201);
    }

    /**
     * Public single — matches legacy /api/works/{id} (no visible filter).
     */
    public function show(string $id): ProjectResource
    {
        $project = Project::with('images')
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return new ProjectResource($project);
    }

    public function update(ProjectRequest $request, Project $project): ProjectResource
    {
        $data = $this->prepareData($request, $project);

        $project->update($data);
        $this->syncImages($project, $request);

        return new ProjectResource($project->load('images'));
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();

        return response()->json(['success' => true]);
    }

    private function prepareData(ProjectRequest $request, ?Project $project = null): array
    {
        $data = $request->validated();

        if (empty($data['slug']) && ! empty($data['title'])) {
            $slug = Str::slug($data['title']);
            $exists = Project::where('slug', $slug)->when($project, fn ($q) => $q->where('id', '!=', $project->id))->exists();
            $data['slug'] = $exists ? $slug.'-'.Str::random(5) : $slug;
        }

        // Legacy gallery convenience: array of urls also mirrored into project_images
        if (isset($data['gallery']) && is_string($data['gallery'])) {
            $decoded = json_decode($data['gallery'], true);
            $data['gallery'] = is_array($decoded) ? $decoded : [];
        }

        return $data;
    }

    private function syncImages(Project $project, ProjectRequest $request): void
    {
        $images = $request->input('images');

        if (! is_array($images)) {
            return;
        }

        $validated = Validator::make(
            ['images' => $images],
            [
                'images' => ['array', 'max:30'],
                'images.*.url' => ['required', 'string'],
                'images.*.type' => ['required', 'in:cover,gallery,desktop,mobile,logo'],
                'images.*.sort_order' => ['nullable', 'integer'],
            ],
        )->validate();

        $project->images()->delete();

        foreach ($validated['images'] as $i => $image) {
            ProjectImage::create([
                'project_id' => $project->id,
                'url' => $image['url'],
                'type' => $image['type'],
                'sort_order' => $image['sort_order'] ?? $i,
            ]);
        }

        // Keep legacy gallery JSON in sync with gallery-type images
        if (empty($request->input('gallery'))) {
            $gallery = array_column(
                array_filter($validated['images'], fn ($i) => $i['type'] === 'gallery'),
                'url'
            );
            $project->update(['gallery' => $gallery]);
        }
    }
}
