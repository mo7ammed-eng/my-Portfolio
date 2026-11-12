<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSection extends Model
{
    protected $fillable = [
        'label', 'ghost_line', 'name_line',
        'paragraph1', 'paragraph2', 'paragraph3',
        'cta_text', 'visible', 'sort_order',
    ];

    protected $casts = ['visible' => 'boolean'];
}
