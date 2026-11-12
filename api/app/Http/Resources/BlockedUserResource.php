<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockedUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'reason' => $this->reason,
            'blocked_by' => $this->blocked_by,
            'is_permanent' => $this->is_permanent,
            'is_active' => $this->is_active,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'unblocked_at' => $this->unblocked_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
