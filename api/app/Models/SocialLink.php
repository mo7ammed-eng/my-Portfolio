<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialLink extends Model
{
    protected $fillable = ['platform', 'label', 'url', 'visible', 'sort_order'];

    protected $casts = ['visible' => 'boolean', 'sort_order' => 'integer'];
}
