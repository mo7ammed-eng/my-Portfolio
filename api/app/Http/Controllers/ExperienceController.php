<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExperienceRequest;
use App\Http\Resources\ExperienceResource;
use App\Models\Experience;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExperienceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Experience::orderByDesc('is_current')->orderBy('sort_order')->orderBy('id');

        if (! $request->boolean('all')) {
            $query->where('visible', true);
        }

        return ExperienceResource::collection($query->get());
    }

    public function store(ExperienceRequest $request): JsonResponse
    {
        $experience = Experience::create($request->validated());

        return (new ExperienceResource($experience))->response()->setStatusCode(201);
    }

    public function show(Experience $experience): ExperienceResource
    {
        return new ExperienceResource($experience);
    }

    public function update(ExperienceRequest $request, Experience $experience): ExperienceResource
    {
        $experience->update($request->validated());

        return new ExperienceResource($experience);
    }

    public function destroy(Experience $experience): JsonResponse
    {
        $experience->delete();

        return response()->json(['success' => true]);
    }
}
