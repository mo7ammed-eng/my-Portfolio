<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'num', 'label', 'title', 'description', 'icon', 'href', 'sort_order', 'visible',
    ];

    protected $casts = ['visible' => 'boolean', 'sort_order' => 'integer'];
}
