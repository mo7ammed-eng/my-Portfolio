<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiClient extends Model
{
    public const TYPES = [
        'website',
        'whatsapp_bot',
        'telegram_bot',
        'mobile_app',
        'external_api',
    ];

    protected $fillable = [
        'name',
        'slug',
        'type',
        'token_hash',
        'token_prefix',
        'is_active',
        'allowed_ips',
        'last_used_at',
        'created_by',
    ];

    protected $hidden = ['token_hash'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'allowed_ips' => 'array',
            'last_used_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(RequestActivity::class);
    }
}
