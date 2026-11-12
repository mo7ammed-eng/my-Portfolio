<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GithubRepositoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'github_id' => $this->github_id,
            'name' => $this->name,
            'full_name' => $this->full_name,
            'owner' => $this->owner,
            'description' => $this->description,
            'html_url' => $this->html_url,
            'default_branch' => $this->default_branch,
            'visibility' => $this->visibility,
            'language' => $this->language,
            'languages' => $this->languages ?? [],
            'topics' => $this->topics ?? [],
            'stars' => $this->stars,
            'forks' => $this->forks,
            'open_issues' => $this->open_issues,
            'size_kb' => $this->size_kb,
            'is_fork' => $this->is_fork,
            'is_archived' => $this->is_archived,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'display_order' => $this->display_order,
            'readme' => $this->when($request->boolean('with_readme'), $this->readme),
            'readme_excerpt' => $this->readme ? mb_substr(strip_tags($this->readme), 0, 240) : null,
            'github_created_at' => $this->github_created_at?->toIso8601String(),
            'github_updated_at' => $this->github_updated_at?->toIso8601String(),
            'github_pushed_at' => $this->github_pushed_at?->toIso8601String(),
            'synced_at' => $this->synced_at?->toIso8601String(),
            'last_sync_error' => $this->last_sync_error,
            'sync_source' => $this->sync_source,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
