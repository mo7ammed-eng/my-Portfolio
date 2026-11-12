<?php

namespace App\Http\Controllers;

use App\Http\Resources\ApiClientResource;
use App\Models\ApiClient;
use App\Models\RequestActivity;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ApiClientController extends Controller
{
    public function index(): JsonResponse
    {
        return ApiClientResource::collection(
            ApiClient::with('creator')->withCount('activities')->orderBy('name')->paginate(25)
        )->response();
    }

    public function store(Request $request, AuditLogger $audit): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(ApiClient::TYPES)],
            'allowed_ips' => ['nullable', 'array', 'max:50'],
            'allowed_ips.*' => ['ip'],
        ]);

        $token = 'pf_'.Str::random(48);

        $client = ApiClient::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'type' => $validated['type'],
            'token_hash' => hash('sha256', $token),
            'token_prefix' => substr($token, 0, 12),
            'is_active' => true,
            'allowed_ips' => $validated['allowed_ips'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $audit->record('api_client.create', 'api_client', (string) $client->id, 'Created API client '.$client->name, [
            'type' => $client->type,
        ]);

        return response()->json([
            'client' => new ApiClientResource($client),
            'token' => $token,
            'note' => 'Store this token now. It cannot be retrieved again.',
        ], 201);
    }

    public function update(Request $request, ApiClient $apiClient, AuditLogger $audit): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'type' => ['sometimes', Rule::in(ApiClient::TYPES)],
            'is_active' => ['sometimes', 'boolean'],
            'allowed_ips' => ['nullable', 'array', 'max:50'],
            'allowed_ips.*' => ['ip'],
        ]);

        $apiClient->update($validated);

        $audit->record('api_client.update', 'api_client', (string) $apiClient->id, 'Updated API client '.$apiClient->name, $validated);

        return response()->json(['client' => new ApiClientResource($apiClient->fresh())]);
    }

    public function regenerateToken(Request $request, ApiClient $apiClient, AuditLogger $audit): JsonResponse
    {
        $token = 'pf_'.Str::random(48);

        $apiClient->update([
            'token_hash' => hash('sha256', $token),
            'token_prefix' => substr($token, 0, 12),
        ]);

        $audit->record('api_client.token_regenerated', 'api_client', (string) $apiClient->id, 'Regenerated token for '.$apiClient->name);

        return response()->json([
            'client' => new ApiClientResource($apiClient->fresh()),
            'token' => $token,
            'note' => 'Previous token is now invalid. Store this one now.',
        ]);
    }

    public function destroy(Request $request, ApiClient $apiClient, AuditLogger $audit): JsonResponse
    {
        $audit->record('api_client.delete', 'api_client', (string) $apiClient->id, 'Deleted API client '.$apiClient->name);
        $apiClient->delete();

        return response()->json(['success' => true]);
    }

    public function sources(): JsonResponse
    {
        $since = now()->subDays(30);

        $clients = ApiClient::select('id', 'name', 'type')
            ->withCount(['activities' => fn ($q) => $q->where('created_at', '>=', $since)])
            ->orderByDesc('activities_count')
            ->get();

        $unattributed = RequestActivity::whereNull('api_client_id')
            ->where('created_at', '>=', $since)
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->get();

        return response()->json([
            'window_days' => 30,
            'clients' => $clients,
            'unattributed' => $unattributed,
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'client';
        $slug = $base;
        $i = 1;

        while (ApiClient::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
