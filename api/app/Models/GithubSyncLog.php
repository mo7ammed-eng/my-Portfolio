<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GithubSyncLog extends Model
{
    protected $fillable = [
        'github_repository_id',
        'action',
        'status',
        'message',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function repository(): BelongsTo
    {
        return $this->belongsTo(GithubRepository::class, 'github_repository_id');
    }
}
