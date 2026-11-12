<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'cover_image', 'status', 'published_at', 'sort_order',
    ];

    protected $casts = ['published_at' => 'datetime', 'sort_order' => 'integer'];
}
