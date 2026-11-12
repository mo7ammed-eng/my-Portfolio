<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'title', 'slug', 'description', 'category', 'tech', 'image_url', 'link',
        'github_url', 'demo_url', 'client', 'month', 'year', 'services', 'review',
        'logo_full_view_url', 'desktop_view_url', 'phone_view_url', 'mobile_image_url',
        'gallery', 'project_date', 'featured', 'visible', 'sort_order',
    ];

    protected $casts = [
        'gallery' => 'json',
        'featured' => 'boolean',
        'visible' => 'boolean',
        'sort_order' => 'integer',
        'project_date' => 'date',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }
}
