<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactMessageRequest;
use App\Http\Resources\ContactMessageResource;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\RateLimiter;

class ContactMessageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = ContactMessage::orderByDesc('created_at');

        if ($request->query('unread') === 'true') {
            $query->where('read', false);
        }

        return ContactMessageResource::collection($query->get());
    }

    public function store(ContactMessageRequest $request): JsonResponse
    {
        $ip = $request->header('x-forwarded-for') ?: $request->header('x-real-ip') ?: $request->ip();

        $key = 'contact:'.$ip;

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'error' => 'Too many messages today. Please try again later.',
            ], 429);
        }

        RateLimiter::hit($key, 86400);

        $message = ContactMessage::create([
            ...$request->validated(),
            'ip' => $ip,
        ]);

        return (new ContactMessageResource($message))->response()->setStatusCode(201);
    }

    public function show(ContactMessage $contactMessage): ContactMessageResource
    {
        return new ContactMessageResource($contactMessage);
    }

    public function update(Request $request, ContactMessage $contactMessage): ContactMessageResource
    {
        $validated = $request->validate([
            'read' => ['nullable', 'boolean'],
            'name' => ['nullable', 'string', 'max:191'],
            'email' => ['nullable', 'email', 'max:191'],
            'message' => ['nullable', 'string'],
        ]);

        $contactMessage->update($validated);

        return new ContactMessageResource($contactMessage);
    }

    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json(['success' => true]);
    }
}
