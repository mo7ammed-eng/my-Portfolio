<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            '_id' => (string) $this->id,
            'id' => $this->id,
            'author' => $this->author,
            'role' => $this->role,
            'company' => $this->company,
            'content' => $this->content,
            'rating' => $this->rating,
            'avatar' => $this->avatar,
            'approved' => $this->approved,
            'sort_order' => $this->sort_order,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
