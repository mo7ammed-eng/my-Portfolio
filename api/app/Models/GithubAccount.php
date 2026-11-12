<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GithubAccount extends Model
{
    protected $fillable = [
        'github_user_id',
        'username',
        'avatar_url',
        'access_token',
        'token_type',
        'scopes',
        'connected_at',
        'last_synced_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'connected_at' => 'datetime',
            'last_synced_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }
}
