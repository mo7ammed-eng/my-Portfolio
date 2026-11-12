<?php

namespace App\Http\Controllers;

use App\Models\AdClick;
use App\Models\ContactMessage;
use App\Models\Search;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    public function visit(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'page' => ['nullable', 'string', 'max:191'],
            'referrer' => ['nullable', 'string', 'max:2048'],
            'source' => ['nullable', 'string', 'max:191'],
        ])->validate();

        $ua = $request->userAgent();
        $ip = $request->ip();

        $country = $request->header('x-vercel-ip-country') ?: $request->header('cf-ipcountry');
        $city = $request->header('x-vercel-ip-city');

        $referrer = $validated['referrer'] ?? null;

        $searchTerms = $this->extractSearchTerms($referrer);

        foreach ($searchTerms as $term) {
            Search::updateOrCreate(
                ['query' => $term],
                ['last_searched' => now()],
            )->increment('count');
        }

        Visit::create([
            'page' => $validated['page'] ?? null,
            'referrer' => $referrer,
            'useragent' => $ua,
            'ip' => $ip,
            'country' => $country,
            'city' => $city,
            'source' => $validated['source'] ?? $this->classifySource($referrer, $ua),
        ]);

        return response()->json(['success' => true]);
    }

    public function click(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'label' => ['nullable', 'string', 'max:191'],
            'url' => ['nullable', 'string', 'max:2048'],
            'page' => ['nullable', 'string', 'max:191'],
        ])->validate();

        AdClick::create($validated);

        return response()->json(['success' => true]);
    }

    public function search(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'query' => ['required', 'string', 'max:255'],
        ])->validate();

        Search::updateOrCreate(
            ['query' => $validated['query']],
            ['last_searched' => now()],
        )->increment('count');

        return response()->json(['success' => true]);
    }

    public function ping(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'sessionId' => ['required', 'string', 'max:128'],
            'page' => ['nullable', 'string', 'max:191'],
        ])->validate();

        $sessions = SiteSetting::firstOrCreate(['key' => 'active_sessions'])->value ?? [];

        $sessions[$validated['sessionId']] = [
            'lastSeen' => now()->toIso8601String(),
            'page' => $validated['page'] ?? '/',
            'startedAt' => $sessions[$validated['sessionId']]['startedAt'] ?? now()->toIso8601String(),
        ];

        // prune sessions idle > 60s
        $sessions = array_filter($sessions, fn ($s) => now()->parse($s['lastSeen'])->diffInSeconds(now()) < 60);

        SiteSetting::updateOrCreate(
            ['key' => 'active_sessions'],
            ['value' => $sessions],
        );

        return response()->json(['success' => true]);
    }

    public function leave(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'sessionId' => ['required', 'string', 'max:128'],
        ])->validate();

        $sessions = SiteSetting::where('key', 'active_sessions')->first()?->value ?? [];
        unset($sessions[$validated['sessionId']]);

        SiteSetting::updateOrCreate(
            ['key' => 'active_sessions'],
            ['value' => $sessions],
        );

        return response()->json(['success' => true]);
    }

    public function activeUsers(): JsonResponse
    {
        $sessions = SiteSetting::where('key', 'active_sessions')->first()?->value ?? [];

        $active = count(array_filter(
            $sessions,
            fn ($s) => now()->parse($s['lastSeen'] ?? 0)->diffInSeconds(now()) < 15
        ));

        return response()->json(['success' => true, 'count' => $active]);
    }

    public function stats(Request $request): JsonResponse
    {
        $month = $request->query('month');
        $year = $request->query('year');

        $visitQuery = Visit::query();
        $clickQuery = AdClick::query();

        if ($month && $year) {
            $visitQuery->whereMonth('created_at', $month)->whereYear('created_at', $year);
            $clickQuery->whereMonth('created_at', $month)->whereYear('created_at', $year);
        }

        $totalVisits = (int) $visitQuery->count();
        $totalClicks = (int) $clickQuery->count();
        $todayVisits = (clone $visitQuery)->whereDate('created_at', today())->count();

        $visitsByPage = (clone $visitQuery)
            ->selectRaw('page as _id, count(*) as count')
            ->whereNotNull('page')
            ->groupBy('page')
            ->orderByDesc('count')
            ->get()->toArray();

        $visitsBySource = (clone $visitQuery)
            ->selectRaw("COALESCE(source, 'direct') as source, count(*) as count")
            ->groupByRaw("COALESCE(source, 'direct')")
            ->orderByDesc('count')
            ->get()->toArray();

        $visitsByCountry = (clone $visitQuery)
            ->selectRaw('country, count(*) as count')
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('count')
            ->get()->toArray();

        $visitsPerDay = (clone $visitQuery)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m-%d') as _id, count(*) as count")
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('_id')
            ->orderBy('_id')
            ->get()->toArray();

        $clicksByLabel = $clickQuery
            ->selectRaw('label as _id, count(*) as count, MAX(url) as url')
            ->whereNotNull('label')
            ->groupBy('label')
            ->orderByDesc('count')
            ->get()->toArray();

        $topSearches = Search::orderByDesc('count')
            ->limit(10)
            ->get(['query', 'count'])
            ->map(fn ($s) => ['query' => $s->query, 'count' => $s->count])
            ->toArray();

        $recentVisits = (clone $visitQuery)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($v) => [
                'page' => $v->page,
                'referrer' => $v->referrer,
                'useragent' => $v->useragent,
                'user_agent' => $v->useragent,
                'city' => $v->city,
                'country' => $v->country,
                'createdAt' => $v->created_at?->toIso8601String(),
            ])
            ->toArray();

        $aiSources = ['chatgpt.com', 'chat.openai.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'copilot.microsoft.com'];
        $aiVisits = (clone $visitQuery)
            ->where(function ($q) use ($aiSources) {
                $q->whereIn('source', $aiSources)
                    ->orWhere('referrer', 'like', '%chatgpt%')
                    ->orWhere('referrer', 'like', '%claude%')
                    ->orWhere('referrer', 'like', '%perplexity%')
                    ->orWhere('useragent', 'like', '%GPTBot%')
                    ->orWhere('useragent', 'like', '%ClaudeBot%');
            })
            ->selectRaw("COALESCE(source, referrer) as source, count(*) as count")
            ->groupByRaw('COALESCE(source, referrer)')
            ->get()->toArray();

        return response()->json([
            'totalVisits' => $totalVisits,
            'todayVisits' => $todayVisits,
            'totalClicks' => $totalClicks,
            'totalReviews' => (int) Testimonial::count(),
            'totalMessages' => (int) ContactMessage::count(),
            'topSearches' => $topSearches,
            'recentVisits' => $recentVisits,
            'clicksByLabel' => $clicksByLabel,
            'visitsByPage' => $visitsByPage,
            'visitsBySource' => $visitsBySource,
            'aiVisits' => $aiVisits,
            'visitsPerDay' => $visitsPerDay,
            'visitsByCountry' => $visitsByCountry,
        ]);
    }

    private function extractSearchTerms(?string $referrer): array
    {
        if (! $referrer) {
            return [];
        }

        $host = parse_url($referrer, PHP_URL_HOST) ?? '';
        $query = parse_url($referrer, PHP_URL_QUERY) ?? '';
        parse_str($query, $params);

        $engines = ['google.', 'bing.', 'yahoo.', 'duckduckgo.'];

        foreach ($engines as $engine) {
            if (str_contains($host, $engine)) {
                $q = $params['q'] ?? $params['p'] ?? null;

                return $q ? [mb_substr($q, 0, 100)] : [];
            }
        }

        return [];
    }

    private function classifySource(?string $referrer, ?string $ua): ?string
    {
        if ($referrer) {
            return parse_url($referrer, PHP_URL_HOST) ?? 'direct';
        }

        $bots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Googlebot', 'Bingbot'];
        foreach ($bots as $bot) {
            if ($UA = $ua && str_contains($ua, $bot)) {
                return strtolower($bot);
            }
        }

        return 'direct';
    }
}
