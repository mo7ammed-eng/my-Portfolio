<?php

namespace App\Http\Controllers;

use App\Http\Requests\TestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestimonialController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Testimonial::orderBy('sort_order')->orderByDesc('created_at');

        if (! $request->boolean('all')) {
            $query->where('approved', true);
        }

        return TestimonialResource::collection($query->get());
    }

    public function store(TestimonialRequest $request): JsonResponse
    {
        $testimonial = Testimonial::create($request->validated());

        return (new TestimonialResource($testimonial))->response()->setStatusCode(201);
    }

    public function show(Testimonial $testimonial): TestimonialResource
    {
        return new TestimonialResource($testimonial);
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial): TestimonialResource
    {
        $testimonial->update($request->validated());

        return new TestimonialResource($testimonial);
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json(['success' => true]);
    }
}
