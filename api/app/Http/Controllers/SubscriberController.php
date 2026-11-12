<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;

class SubscriberController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return AnonymousResourceCollection::make(
            Subscriber::orderByDesc('created_at')->get(),
            fn ($s) => ['id' => $s->id, 'email' => $s->email, 'created_at' => $s->created_at?->toIso8601String()]
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'email' => ['required', 'email', 'max:191'],
        ])->validate();

        $exists = Subscriber::where('email', $validated['email'])->exists();

        if ($exists) {
            return response()->json(['success' => true, 'message' => 'Already subscribed!']);
        }

        Subscriber::create(['email' => $validated['email']]);

        return response()->json(['success' => true, 'message' => 'Subscribed!'], 201);
    }
}
