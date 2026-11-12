<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Service::orderBy('sort_order')->orderBy('id');

        if (! $request->boolean('all')) {
            $query->where('visible', true);
        }

        return ServiceResource::collection($query->get());
    }

    public function store(ServiceRequest $request): JsonResponse
    {
        $service = Service::create($request->validated());

        return (new ServiceResource($service))->response()->setStatusCode(201);
    }

    public function show(Service $service): ServiceResource
    {
        return new ServiceResource($service);
    }

    public function update(ServiceRequest $request, Service $service): ServiceResource
    {
        $service->update($request->validated());

        return new ServiceResource($service);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json(['success' => true]);
    }
}
