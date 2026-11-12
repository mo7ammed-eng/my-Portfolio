<?php

namespace App\Http\Controllers;

use App\Http\Requests\SkillCategoryRequest;
use App\Http\Resources\SkillCategoryResource;
use App\Models\SkillCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SkillCategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = SkillCategory::with('skills')->orderBy('sort_order')->orderBy('id');

        if (! $request->boolean('all')) {
            $query->whereHas('skills', fn ($q) => $q->where('visible', true));
        }

        return SkillCategoryResource::collection($query->get());
    }

    public function store(SkillCategoryRequest $request): JsonResponse
    {
        $category = SkillCategory::create($request->validated());

        return (new SkillCategoryResource($category->load('skills')))->response()->setStatusCode(201);
    }

    public function show(SkillCategory $category): SkillCategoryResource
    {
        return new SkillCategoryResource($category->load('skills'));
    }

    public function update(SkillCategoryRequest $request, SkillCategory $category): SkillCategoryResource
    {
        $category->update($request->validated());

        return new SkillCategoryResource($category->load('skills'));
    }

    public function destroy(SkillCategory $category): JsonResponse
    {
        $category->delete();

        return response()->json(['success' => true]);
    }
}
