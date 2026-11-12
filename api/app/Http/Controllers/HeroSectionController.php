<?php

namespace App\Http\Controllers;

use App\Http\Requests\HeroSectionRequest;
use App\Http\Resources\HeroSectionResource;
use App\Models\HeroSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HeroSectionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = HeroSection::orderBy('sort_order')->orderBy('id');

        if (! $request->boolean('all')) {
            $query->where('visible', true);
        }

        return HeroSectionResource::collection($query->get());
    }

    public function store(HeroSectionRequest $request): JsonResponse
    {
        $hero = HeroSection::create($request->validated());

        return (new HeroSectionResource($hero))->response()->setStatusCode(201);
    }

    public function show(HeroSection $hero): HeroSectionResource
    {
        return new HeroSectionResource($hero);
    }

    public function update(HeroSectionRequest $request, HeroSection $hero): HeroSectionResource
    {
        $hero->update($request->validated());

        return new HeroSectionResource($hero);
    }

    public function destroy(HeroSection $hero): JsonResponse
    {
        $hero->delete();

        return response()->json(['success' => true]);
    }
}
