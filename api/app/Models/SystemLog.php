<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    public const UPDATED_AT = null;

    public const LEVELS = ['debug', 'info', 'warning', 'error', 'critical'];

    public const CATEGORIES = ['frontend', 'backend', 'api', 'database', 'security', 'general'];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    protected $fillable = [
        'uuid',
        'level',
        'category',
        'message',
        'exception_class',
        'stack_trace',
        'source',
        'request_url',
        'http_method',
        'http_status',
        'user_id',
        'ip',
        'user_agent',
        'context',
        'occurred_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'occurred_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }
}
