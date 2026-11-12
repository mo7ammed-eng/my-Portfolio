<?php

namespace App\Http\Controllers;

use App\Http\Requests\SocialLinkRequest;
use App\Http\Resources\SocialLinkResource;
use App\Models\SocialLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SocialLinkController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = SocialLink::orderBy('sort_order')->orderBy('id');

        if (! $request->boolean('all')) {
            $query->where('visible', true);
        }

        return SocialLinkResource::collection($query->get());
    }

    public function store(SocialLinkRequest $request): JsonResponse
    {
        $link = SocialLink::create($request->validated());

        return (new SocialLinkResource($link))->response()->setStatusCode(201);
    }

    public function show(SocialLink $socialLink): SocialLinkResource
    {
        return new SocialLinkResource($socialLink);
    }

    public function update(SocialLinkRequest $request, SocialLink $socialLink): SocialLinkResource
    {
        $socialLink->update($request->validated());

        return new SocialLinkResource($socialLink);
    }

    public function destroy(SocialLink $socialLink): JsonResponse
    {
        $socialLink->delete();

        return response()->json(['success' => true]);
    }
}
