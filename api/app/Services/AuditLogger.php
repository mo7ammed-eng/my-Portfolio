<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogger
{
    public function record(
        string $action,
        ?string $targetType = null,
        ?string $targetId = null,
        ?string $description = null,
        array $metadata = [],
        ?Request $request = null
    ): AuditLog {
        $request ??= app()->bound('request') ? request() : null;

        return AuditLog::create([
            'admin_id' => ($request?->user() ?? $request?->user('sanctum'))?->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'description' => $description,
            'metadata' => $metadata ?: null,
            'ip' => $request?->ip(),
            'created_at' => now(),
        ]);
    }
}
