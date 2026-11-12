<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'author', 'role', 'company', 'content', 'rating', 'avatar', 'approved', 'sort_order',
    ];

    protected $casts = [
        'approved' => 'boolean',
        'rating' => 'integer',
        'sort_order' => 'integer',
    ];
}
