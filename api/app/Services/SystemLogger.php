<?php

namespace App\Services;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class SystemLogger
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'token',
        'access_token',
        'refresh_token',
        'authorization',
        'cookie',
        'api_key',
        'secret',
        'client_secret',
        'private_key',
    ];

    public function log(
        string $level,
        string $category,
        string $message,
        array $context = [],
        ?Throwable $exception = null
    ): ?SystemLog {
        try {
            $request = app()->bound('request') ? request() : null;

            $payload = [
                'uuid' => (string) Str::uuid(),
                'level' => in_array($level, SystemLog::LEVELS, true) ? $level : 'info',
                'category' => in_array($category, SystemLog::CATEGORIES, true) ? $category : 'general',
                'message' => Str::limit($this->sanitizeText($message), 5000),
                'exception_class' => $exception ? get_class($exception) : ($context['exception_class'] ?? null),
                'stack_trace' => $exception ? Str::limit($exception->getTraceAsString(), 20000) : null,
                'source' => $context['source'] ?? null,
                'request_url' => $context['request_url'] ?? ($request?->fullUrl()),
                'http_method' => $context['http_method'] ?? ($request?->method()),
                'http_status' => $context['http_status'] ?? null,
                'user_id' => $context['user_id'] ?? (($request?->user() ?? $request?->user('sanctum'))?->id),
                'ip' => $context['ip'] ?? ($request?->ip()),
                'user_agent' => $context['user_agent'] ?? ($request?->userAgent()),
                'context' => $this->redact($context ?: null),
                'occurred_at' => now(),
                'created_at' => now(),
            ];

            $log = SystemLog::create($payload);

            Log::channel(config('logging.default'))->{$payload['level']}($message, [
                'category' => $payload['category'],
                'source' => $payload['source'],
            ]);

            return $log;
        } catch (Throwable) {
            return null;
        }
    }

    public function exception(Throwable $exception): void
    {
        if ($exception instanceof \Illuminate\Validation\ValidationException
            || $exception instanceof \Illuminate\Auth\AuthenticationException
            || $exception instanceof \Illuminate\Auth\Access\AuthorizationException
            || $exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            return;
        }

        $status = method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;
        $level = $status >= 500 ? 'critical' : 'error';

        $this->log($level, $this->categorize($exception), $exception->getMessage(), [
            'source' => $exception->getFile().':'.$exception->getLine(),
            'http_status' => $status,
        ], $exception);
    }

    public function security(string $type, string $description, array $context = []): void
    {
        $this->log('warning', 'security', $description, array_merge([
            'source' => $type,
        ], $context));
    }

    private function categorize(Throwable $exception): string
    {
        $class = get_class($exception);

        if (str_contains($class, 'Database') || str_contains($class, 'Query')) {
            return 'database';
        }

        if (str_contains($class, 'Http') || str_contains($class, 'Api')) {
            return 'api';
        }

        return 'backend';
    }

    private function redact(?array $context): ?array
    {
        if ($context === null) {
            return null;
        }

        $clean = [];
        foreach ($context as $key => $value) {
            if (in_array(strtolower((string) $key), self::SENSITIVE_KEYS, true)) {
                $clean[$key] = '[redacted]';
                continue;
            }
            if (is_array($value)) {
                $clean[$key] = $this->redact($value);
            } else {
                $clean[$key] = is_string($value) ? Str::limit($this->sanitizeText($value), 2000) : $value;
            }
        }

        return $clean;
    }

    private function sanitizeText(string $value): string
    {
        return preg_replace('/\b(Bearer\s+)[A-Za-z0-9\-._~+\/]+=*/', '$1[redacted]', $value) ?? $value;
    }
}
