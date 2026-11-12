<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visitor_session_id' => $this->visitor_session_id,
            'session_key' => $this->whenLoaded('visitor', fn () => $this->visitor?->session_key),
            'api_client_id' => $this->api_client_id,
            'client' => $this->whenLoaded('client', fn () => $this->client?->name),
            'user_id' => $this->user_id,
            'source' => $this->source,
            'client_identifier' => $this->client_identifier,
            'method' => $this->method,
            'endpoint' => $this->endpoint,
            'path' => $this->path,
            'status' => $this->status,
            'duration_ms' => $this->duration_ms,
            'ip' => $this->ip,
            'user_agent' => $this->user_agent,
            'referer' => $this->referer,
            'is_error' => $this->is_error,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
