<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AboutSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'heading_line1' => $this->heading_line1,
            'heading_line2' => $this->heading_line2,
            'heading_line3' => $this->heading_line3,
            'bio' => $this->bio ?? [],
            'resume_url' => $this->resume_url,
            'image_url' => $this->image_url,
            'visible' => $this->visible,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
