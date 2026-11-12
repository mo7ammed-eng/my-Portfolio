<?php

namespace App\Http\Controllers;

use App\Http\Requests\SkillRequest;
use App\Http\Resources\SkillResource;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SkillController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Skill::with('category')->orderBy('sort_order')->orderBy('id');

        if (! $request->boolean('all')) {
            $query->where('visible', true);
        }

        return SkillResource::collection($query->get());
    }

    public function store(SkillRequest $request): JsonResponse
    {
        $skill = Skill::create($request->validated());

        return (new SkillResource($skill->load('category')))->response()->setStatusCode(201);
    }

    public function show(Skill $skill): SkillResource
    {
        return new SkillResource($skill->load('category'));
    }

    public function update(SkillRequest $request, Skill $skill): SkillResource
    {
        $skill->update($request->validated());

        return new SkillResource($skill->load('category'));
    }

    public function destroy(Skill $skill): JsonResponse
    {
        $skill->delete();

        return response()->json(['success' => true]);
    }
}
