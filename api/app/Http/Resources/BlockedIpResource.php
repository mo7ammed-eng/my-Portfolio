<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockedIpResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ip' => $this->ip,
            'reason' => $this->reason,
            'blocked_by' => $this->blocked_by,
            'blocked_by_name' => $this->whenLoaded('blockedBy', fn () => $this->blockedBy?->name),
            'is_permanent' => $this->is_permanent,
            'is_active' => $this->is_active,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'unblocked_at' => $this->unblocked_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
