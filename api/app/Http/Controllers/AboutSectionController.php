<?php

namespace App\Http\Controllers;

use App\Http\Requests\AboutSectionRequest;
use App\Http\Resources\AboutSectionResource;
use App\Models\AboutSection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AboutSectionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = AboutSection::orderBy('id');

        if (! $request->boolean('all')) {
            $query->where('visible', true);
        }

        return AboutSectionResource::collection($query->get());
    }

    public function store(AboutSectionRequest $request): JsonResponse
    {
        $about = AboutSection::create($request->validated());

        return (new AboutSectionResource($about))->response()->setStatusCode(201);
    }

    public function show(AboutSection $about): AboutSectionResource
    {
        return new AboutSectionResource($about);
    }

    public function update(AboutSectionRequest $request, AboutSection $about): AboutSectionResource
    {
        $about->update($request->validated());

        return new AboutSectionResource($about);
    }

    public function destroy(AboutSection $about): JsonResponse
    {
        $about->delete();

        return response()->json(['success' => true]);
    }
}
