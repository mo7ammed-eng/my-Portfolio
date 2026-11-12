<?php

namespace App\Http\Controllers;

use App\Http\Resources\SystemLogResource;
use App\Models\SystemLog;
use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SystemConsoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = $this->filtered($request)->latest('created_at')->paginate((int) $request->query('per_page', 25))->withQueryString();

        return SystemLogResource::collection($logs)->response();
    }

    public function show(Request $request, SystemLog $systemLog): JsonResponse
    {
        $request->merge(['with_trace' => true]);

        return response()->json(['log' => new SystemLogResource($systemLog)]);
    }

    public function stats(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 1);
        $days = max(1, min(90, $days));
        $from = now()->subDays($days);

        $byLevel = SystemLog::where('created_at', '>=', $from)
            ->selectRaw('level, COUNT(*) as count')
            ->groupBy('level')
            ->get()
            ->pluck('count', 'level');

        $byCategory = SystemLog::where('created_at', '>=', $from)
            ->selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['category' => $row->category, 'count' => (int) $row->count]);

        $series = SystemLog::where('created_at', '>=', $from)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-%d %H:00') as hour, COUNT(*) as count")
            ->whereIn('level', ['error', 'critical'])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(fn ($row) => ['hour' => $row->hour, 'count' => (int) $row->count]);

        return response()->json([
            'days' => $days,
            'by_level' => $byLevel,
            'by_category' => $byCategory,
            'error_series' => $series,
            'retention_days' => (int) config('monitoring.log_retention_days', 30),
        ]);
    }

    public function clear(Request $request, AuditLogger $audit): JsonResponse
    {
        $validated = $request->validate([
            'days' => ['required', 'integer', 'min:1', 'max:365'],
        ]);

        $cutoff = now()->subDays($validated['days']);
        $deleted = SystemLog::where('created_at', '<', $cutoff)->delete();

        $audit->record('logs.clear', 'system_log', null, "Cleared {$deleted} logs older than {$validated['days']} days", [
            'days' => $validated['days'],
            'deleted' => $deleted,
        ]);

        return response()->json(['success' => true, 'deleted' => $deleted]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filename = 'system-logs-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($request) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['uuid', 'level', 'category', 'message', 'source', 'method', 'status', 'ip', 'created_at']);

            $this->filtered($request)->latest('created_at')->limit(5000)->chunk(500, function ($logs) use ($out) {
                foreach ($logs as $log) {
                    fputcsv($out, [
                        $log->uuid,
                        $log->level,
                        $log->category,
                        $this->csvSafe($log->message),
                        $this->csvSafe($log->source),
                        $log->http_method,
                        $log->http_status,
                        $log->ip,
                        $log->created_at?->toIso8601String(),
                    ]);
                }
            });

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function filtered(Request $request): Builder
    {
        $query = SystemLog::query();

        if ($level = $request->query('level')) {
            if ($level === 'critical') {
                $query->whereIn('level', ['critical']);
            } elseif (in_array($level, SystemLog::LEVELS, true)) {
                $query->where('level', $level);
            }
        }

        if ($category = $request->query('category')) {
            if (in_array($category, SystemLog::CATEGORIES, true)) {
                $query->where('category', $category);
            }
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($q) use ($search) {
                $q->where('message', 'like', "%{$search}%")
                    ->orWhere('source', 'like', "%{$search}%")
                    ->orWhere('exception_class', 'like', "%{$search}%")
                    ->orWhere('request_url', 'like', "%{$search}%");
            });
        }

        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', $to);
        }

        return $query;
    }

    private function csvSafe(?string $value): string
    {
        $value = (string) $value;

        return preg_match('/^[=+\-@]/', $value) ? "'".$value : $value;
    }
}
