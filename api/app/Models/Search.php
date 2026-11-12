<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Search extends Model
{
    protected $fillable = ['query', 'count', 'last_searched'];

    protected $casts = ['count' => 'integer', 'last_searched' => 'datetime'];
}
