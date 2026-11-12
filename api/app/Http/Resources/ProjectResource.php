<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $images = $this->whenLoaded('images');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'category' => $this->category,
            'tech' => $this->tech,
            'image_url' => $this->image_url,
            'link' => $this->link,
            'github_url' => $this->github_url,
            'demo_url' => $this->demo_url,
            'client' => $this->client,
            'month' => $this->month,
            'year' => $this->year,
            'services' => $this->services,
            'review' => $this->review,
            'logo_full_view_url' => $this->logo_full_view_url,
            'desktop_view_url' => $this->desktop_view_url,
            'phone_view_url' => $this->phone_view_url,
            'mobile_image_url' => $this->mobile_image_url,
            'gallery' => $this->gallery ?? [],
            'project_date' => $this->project_date?->toDateString(),
            'featured' => $this->featured,
            'visible' => $this->visible,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'images' => ProjectImageResource::collection($images),
        ];
    }
}
