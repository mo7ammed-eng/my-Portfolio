<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'num' => $this->num,
            'label' => $this->label,
            'title' => $this->title,
            'description' => $this->description,
            'icon' => $this->icon,
            'href' => $this->href,
            'sort_order' => $this->sort_order,
            'visible' => $this->visible,
        ];
    }
}
