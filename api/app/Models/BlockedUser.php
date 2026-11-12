<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedUser extends Model
{
    protected $fillable = [
        'user_id',
        'reason',
        'blocked_by',
        'expires_at',
        'is_permanent',
        'is_active',
        'unblocked_at',
        'unblocked_by',
    ];

    protected function casts(): array
    {
        return [
            'is_permanent' => 'boolean',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
            'unblocked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function blockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocked_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->where('is_permanent', true)
                    ->orWhereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function isExpired(): bool
    {
        return ! $this->is_permanent && $this->expires_at && $this->expires_at->isPast();
    }
}
