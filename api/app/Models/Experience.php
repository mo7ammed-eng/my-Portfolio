<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    protected $fillable = [
        'role', 'company', 'location', 'description',
        'start_date', 'end_date', 'is_current', 'sort_order', 'visible',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'visible' => 'boolean',
        'sort_order' => 'integer',
    ];
}
