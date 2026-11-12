<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'level' => $this->level,
            'category' => $this->category,
            'message' => $this->message,
            'exception_class' => $this->exception_class,
            'stack_trace' => $this->when($request->boolean('with_trace'), $this->stack_trace),
            'source' => $this->source,
            'request_url' => $this->request_url,
            'http_method' => $this->http_method,
            'http_status' => $this->http_status,
            'user_id' => $this->user_id,
            'ip' => $this->ip,
            'user_agent' => $this->user_agent,
            'context' => $this->context,
            'occurred_at' => $this->occurred_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
