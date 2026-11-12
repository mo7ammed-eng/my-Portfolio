<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HeroSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'ghost_line' => $this->ghost_line,
            'name_line' => $this->name_line,
            'paragraph1' => $this->paragraph1,
            'paragraph2' => $this->paragraph2,
            'paragraph3' => $this->paragraph3,
            'cta_text' => $this->cta_text,
            'visible' => $this->visible,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
