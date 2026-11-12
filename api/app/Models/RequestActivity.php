<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestActivity extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'visitor_session_id',
        'api_client_id',
        'user_id',
        'source',
        'client_identifier',
        'method',
        'endpoint',
        'path',
        'status',
        'duration_ms',
        'ip',
        'user_agent',
        'referer',
        'is_error',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'is_error' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class, 'visitor_session_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ApiClient::class, 'api_client_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
