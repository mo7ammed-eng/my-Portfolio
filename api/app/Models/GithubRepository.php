<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GithubRepository extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_HIDDEN = 'hidden';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_PUBLISHED,
        self::STATUS_REJECTED,
        self::STATUS_HIDDEN,
    ];

    protected $fillable = [
        'github_id',
        'name',
        'full_name',
        'owner',
        'description',
        'html_url',
        'default_branch',
        'visibility',
        'language',
        'languages',
        'topics',
        'stars',
        'forks',
        'open_issues',
        'size_kb',
        'readme',
        'readme_fetched_at',
        'is_fork',
        'is_archived',
        'status',
        'is_featured',
        'display_order',
        'github_created_at',
        'github_updated_at',
        'github_pushed_at',
        'synced_at',
        'last_sync_error',
        'sync_source',
    ];

    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'topics' => 'array',
            'is_fork' => 'boolean',
            'is_archived' => 'boolean',
            'is_featured' => 'boolean',
            'readme_fetched_at' => 'datetime',
            'github_created_at' => 'datetime',
            'github_updated_at' => 'datetime',
            'github_pushed_at' => 'datetime',
            'synced_at' => 'datetime',
        ];
    }

    public function syncLogs(): HasMany
    {
        return $this->hasMany(GithubSyncLog::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    public function scopePubliclyVisible($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED)->where('visibility', 'public');
    }

    public function scopeOrdered($query)
    {
        return $query->orderByDesc('is_featured')->orderBy('display_order')->orderByDesc('github_pushed_at');
    }

    public function isPubliclyVisible(): bool
    {
        return $this->status === self::STATUS_PUBLISHED && $this->visibility === 'public';
    }
}
