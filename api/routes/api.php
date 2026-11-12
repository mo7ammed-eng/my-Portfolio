<?php

use App\Http\Controllers\AboutSectionController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ApiClientController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\ClientLogController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\GithubAdminController;
use App\Http\Controllers\GithubPublicController;
use App\Http\Controllers\GithubWebhookController;
use App\Http\Controllers\HeroSectionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SkillCategoryController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\SocialLinkController;
use App\Http\Controllers\SubscriberController;
use App\Http\Controllers\SystemConsoleController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\VisitorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Auth ────────────────────────────────────────────────────────────────────
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ── Public content ──────────────────────────────────────────────────────────
Route::get('/hero', [HeroSectionController::class, 'index']);
Route::get('/about', [AboutSectionController::class, 'index']);
Route::get('/skills', [SkillCategoryController::class, 'index']);
Route::get('/skills-flat', [SkillController::class, 'index']);
Route::get('/experiences', [ExperienceController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/social-links', [SocialLinkController::class, 'index']);
Route::get('/testimonials', [TestimonialController::class, 'index']);
Route::get('/blog', [BlogPostController::class, 'index']);
Route::get('/blog/{idOrSlug}', [BlogPostController::class, 'show']);

// Works-compatible project endpoints (legacy frontend contract)
Route::get('/works', [ProjectController::class, 'index']);
Route::get('/works/{id}', [ProjectController::class, 'show']);
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);

// Settings (public read)
Route::get('/settings/{scope?}', [SettingController::class, 'index'])->whereIn('scope', ['site', 'seo', 'theme']);
Route::get('/settings/{scope}/{key}', [SettingController::class, 'show'])->whereIn('scope', ['site', 'seo', 'theme']);

// Public interactions
Route::post('/contact', [ContactMessageController::class, 'store'])->middleware('throttle:20,1');
Route::post('/subscribe', [SubscriberController::class, 'store'])->middleware('throttle:10,1');

// Analytics (public ingest)
Route::post('/visits', [AnalyticsController::class, 'visit'])->middleware('throttle:120,1');
Route::post('/clicks', [AnalyticsController::class, 'click'])->middleware('throttle:120,1');
Route::post('/searches', [AnalyticsController::class, 'search'])->middleware('throttle:60,1');
Route::post('/sessions/ping', [AnalyticsController::class, 'ping']);
Route::post('/sessions/leave', [AnalyticsController::class, 'leave']);
Route::get('/sessions/active', [AnalyticsController::class, 'activeUsers']);

// ── Developer platform: public repositories ─────────────────────────────────
Route::get('/github/languages', [GithubPublicController::class, 'languages']);
Route::get('/github/repositories', [GithubPublicController::class, 'index']);
Route::get('/github/repositories/{owner}/{repo}', [GithubPublicController::class, 'show']);
Route::get('/github/repositories/{owner}/{repo}/tree', [GithubPublicController::class, 'tree']);
Route::get('/github/repositories/{owner}/{repo}/file', [GithubPublicController::class, 'file']);
Route::post('/github/webhook', GithubWebhookController::class)->middleware('throttle:120,1');

// ── Frontend log ingestion ──────────────────────────────────────────────────
Route::post('/logs/client', [ClientLogController::class, 'store'])->middleware('throttle:60,1');

// ── Admin (Sanctum) ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::post('/uploads', [UploadController::class, 'store']);

    Route::get('/admin/analytics/stats', [AnalyticsController::class, 'stats']);
    Route::get('/admin/messages', [ContactMessageController::class, 'index']);
    Route::post('/admin/messages', [ContactMessageController::class, 'store']);
    Route::patch('/admin/messages/{contactMessage}', [ContactMessageController::class, 'update']);
    Route::delete('/admin/messages/{contactMessage}', [ContactMessageController::class, 'destroy']);
    Route::get('/admin/subscribers', [SubscriberController::class, 'index']);

    Route::patch('/settings/{scope}', [SettingController::class, 'upsert'])->whereIn('scope', ['site', 'seo', 'theme']);
    Route::post('/settings/{scope}/bulk', [SettingController::class, 'bulkUpsert'])->whereIn('scope', ['site', 'seo', 'theme']);

    Route::apiResource('admin/hero', HeroSectionController::class);
    Route::apiResource('admin/about', AboutSectionController::class);
    Route::apiResource('admin/skill-categories', SkillCategoryController::class);
    Route::apiResource('admin/skills', SkillController::class);
    Route::apiResource('admin/experiences', ExperienceController::class);
    Route::apiResource('admin/services', ServiceController::class);
    Route::apiResource('admin/testimonials', TestimonialController::class);
    Route::apiResource('admin/blog', BlogPostController::class)->parameters(['blog' => 'blogPost']);
    Route::apiResource('admin/social-links', SocialLinkController::class);
    Route::apiResource('admin/works', ProjectController::class)->parameters(['works' => 'project']);
});

// ── Developer platform: administration ──────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/admin/github/status', [GithubAdminController::class, 'status']);
    Route::post('/admin/github/oauth/url', [GithubAdminController::class, 'oauthUrl']);
    Route::post('/admin/github/oauth/exchange', [GithubAdminController::class, 'exchange']);
    Route::post('/admin/github/disconnect', [GithubAdminController::class, 'disconnect']);
    Route::post('/admin/github/sync', [GithubAdminController::class, 'sync']);
    Route::get('/admin/github/sync-logs', [GithubAdminController::class, 'syncLogs']);
    Route::post('/admin/github/import', [GithubAdminController::class, 'import']);
    Route::get('/admin/github/repositories', [GithubAdminController::class, 'index']);
    Route::get('/admin/github/repositories/{repository}', [GithubAdminController::class, 'show']);
    Route::patch('/admin/github/repositories/{repository}', [GithubAdminController::class, 'update']);
    Route::delete('/admin/github/repositories/{repository}', [GithubAdminController::class, 'destroy']);
    Route::post('/admin/github/repositories/{repository}/refresh', [GithubAdminController::class, 'refresh']);

    Route::get('/admin/system-logs/export', [SystemConsoleController::class, 'export']);
    Route::get('/admin/system-logs/stats', [SystemConsoleController::class, 'stats']);
    Route::delete('/admin/system-logs', [SystemConsoleController::class, 'clear']);
    Route::get('/admin/system-logs', [SystemConsoleController::class, 'index']);
    Route::get('/admin/system-logs/{systemLog}', [SystemConsoleController::class, 'show']);

    Route::get('/admin/visitors/active', [VisitorController::class, 'active']);
    Route::get('/admin/visitors', [VisitorController::class, 'index']);
    Route::get('/admin/visitors/{sessionKey}', [VisitorController::class, 'show']);
    Route::get('/admin/requests', [VisitorController::class, 'requests']);

    Route::get('/admin/security/summary', [SecurityController::class, 'summary']);
    Route::get('/admin/security/blocked-ips', [SecurityController::class, 'blockedIps']);
    Route::post('/admin/security/blocked-ips', [SecurityController::class, 'blockIp']);
    Route::delete('/admin/security/blocked-ips/{blockedIp}', [SecurityController::class, 'unblockIp']);
    Route::get('/admin/security/blocked-users', [SecurityController::class, 'blockedUsers']);
    Route::post('/admin/security/blocked-users', [SecurityController::class, 'blockUser']);
    Route::delete('/admin/security/blocked-users/{blockedUser}', [SecurityController::class, 'unblockUser']);
    Route::get('/admin/security/events', [SecurityController::class, 'events']);
    Route::get('/admin/security/audit-logs', [SecurityController::class, 'auditLogs']);

    Route::get('/admin/api-clients/sources', [ApiClientController::class, 'sources']);
    Route::get('/admin/api-clients', [ApiClientController::class, 'index']);
    Route::post('/admin/api-clients', [ApiClientController::class, 'store']);
    Route::patch('/admin/api-clients/{apiClient}', [ApiClientController::class, 'update']);
    Route::delete('/admin/api-clients/{apiClient}', [ApiClientController::class, 'destroy']);
    Route::post('/admin/api-clients/{apiClient}/token', [ApiClientController::class, 'regenerateToken']);
});
