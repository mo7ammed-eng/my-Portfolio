<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VisitorSession extends Model
{
    protected $fillable = [
        'session_key',
        'user_id',
        'ip',
        'country',
        'city',
        'browser',
        'browser_version',
        'os',
        'device_type',
        'user_agent',
        'is_bot',
        'requests_count',
        'pages_count',
        'first_seen_at',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'is_bot' => 'boolean',
            'first_seen_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(RequestActivity::class);
    }
}
