<?php

namespace App\Http\Controllers;

use App\Models\GithubSyncLog;
use App\Models\SecurityEvent;
use App\Services\GitHubSyncService;
use App\Services\SystemLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GithubWebhookController extends Controller
{
    public function __invoke(Request $request, GitHubSyncService $sync): JsonResponse
    {
        $secret = (string) config('github.webhook_secret');

        if ($secret === '') {
            return response()->json(['message' => 'Webhook secret is not configured.'], 503);
        }

        $signature = (string) $request->header('X-Hub-Signature-256');
        $raw = $request->getContent();
        $expected = 'sha256='.hash_hmac('sha256', $raw, $secret);

        if ($signature === '' || ! hash_equals($expected, $signature)) {
            app(SystemLogger::class)->log('warning', 'security', 'Invalid GitHub webhook signature', [
                'source' => 'github_webhook',
                'ip' => $request->ip(),
                'http_status' => 401,
            ]);

            SecurityEvent::create([
                'type' => 'webhook_invalid_signature',
                'severity' => 'high',
                'description' => 'A request to the GitHub webhook endpoint failed signature verification.',
                'ip' => $request->ip(),
                'metadata' => ['event' => $request->header('X-GitHub-Event')],
                'created_at' => now(),
            ]);

            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $event = (string) $request->header('X-GitHub-Event');
        $payload = json_decode($raw, true) ?: [];

        if ($event === 'ping') {
            return response()->json(['message' => 'pong'], 200);
        }

        $repositoryPayload = $payload['repository'] ?? null;

        if (! is_array($repositoryPayload) || empty($repositoryPayload['id'])) {
            GithubSyncLog::create([
                'action' => 'webhook_'.$event,
                'status' => 'ignored',
                'message' => 'No repository payload for event '.$event,
            ]);

            return response()->json(['message' => 'Ignored event.'], 202);
        }

        if (! in_array($event, ['repository', 'push', 'create', 'public', 'release'], true)) {
            return response()->json(['message' => 'Event acknowledged.'], 202);
        }

        try {
            $repository = $sync->syncPayload($repositoryPayload, 'webhook', in_array($event, ['repository', 'create', 'public'], true));
        } catch (\Throwable $e) {
            GithubSyncLog::create([
                'action' => 'webhook_'.$event,
                'status' => 'failed',
                'message' => $e->getMessage(),
                'payload' => ['event' => $event, 'full_name' => $repositoryPayload['full_name'] ?? null],
            ]);

            return response()->json(['message' => 'Stored with errors.'], 202);
        }

        if ($event === 'push') {
            $repository->update(['github_pushed_at' => now()]);
        }

        return response()->json([
            'message' => 'Repository synchronized.',
            'repository' => $repository->full_name,
            'status' => $repository->status,
        ], 202);
    }
}
