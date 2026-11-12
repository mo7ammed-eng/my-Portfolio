<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutSection extends Model
{
    protected $fillable = [
        'label', 'heading_line1', 'heading_line2', 'heading_line3',
        'bio', 'resume_url', 'image_url', 'visible',
    ];

    protected $casts = [
        'bio' => 'json',
        'visible' => 'boolean',
    ];
}
