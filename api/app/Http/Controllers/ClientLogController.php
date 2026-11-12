<?php

namespace App\Http\Controllers;

use App\Services\SystemLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientLogController extends Controller
{
    public function store(Request $request, SystemLogger $logger): JsonResponse
    {
        $validated = $request->validate([
            'level' => ['nullable', 'in:debug,info,warning,error'],
            'message' => ['required', 'string', 'max:4000'],
            'stack_trace' => ['nullable', 'string', 'max:20000'],
            'source' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2048'],
            'http_status' => ['nullable', 'integer', 'between:100,599'],
            'context' => ['nullable', 'array'],
        ]);

        $logger->log(
            $validated['level'] ?? 'error',
            'frontend',
            $validated['message'],
            [
                'source' => $validated['source'] ?? 'client',
                'request_url' => $validated['url'] ?? $request->header('Referer'),
                'http_status' => $validated['http_status'] ?? null,
                'context' => $validated['context'] ?? [],
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
            ]
        );

        return response()->json(['success' => true], 202);
    }
}
