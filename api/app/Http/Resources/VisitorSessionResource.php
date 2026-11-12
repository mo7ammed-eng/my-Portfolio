<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitorSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_key' => $this->session_key,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'ip' => $this->ip,
            'country' => $this->country,
            'city' => $this->city,
            'browser' => $this->browser,
            'browser_version' => $this->browser_version,
            'os' => $this->os,
            'device_type' => $this->device_type,
            'user_agent' => $this->user_agent,
            'is_bot' => $this->is_bot,
            'requests_count' => $this->requests_count,
            'pages_count' => $this->pages_count,
            'first_seen_at' => $this->first_seen_at?->toIso8601String(),
            'last_activity_at' => $this->last_activity_at?->toIso8601String(),
            'is_active' => $this->last_activity_at && $this->last_activity_at->gt(now()->subMinutes(5)),
        ];
    }
}
