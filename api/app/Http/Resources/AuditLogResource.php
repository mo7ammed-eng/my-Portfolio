<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'admin_id' => $this->admin_id,
            'admin' => $this->whenLoaded('admin', fn () => $this->admin?->name),
            'action' => $this->action,
            'target_type' => $this->target_type,
            'target_id' => $this->target_id,
            'description' => $this->description,
            'metadata' => $this->metadata,
            'ip' => $this->ip,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
