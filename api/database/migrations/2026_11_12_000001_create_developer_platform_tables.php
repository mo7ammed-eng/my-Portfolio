<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_admin')->default(false)->after('password');
            $table->timestamp('last_login_at')->nullable()->after('is_admin');
        });

        DB::table('users')->update(['is_admin' => true]);

        Schema::create('github_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('github_user_id')->nullable();
            $table->string('username')->nullable();
            $table->string('avatar_url')->nullable();
            $table->text('access_token')->nullable();
            $table->string('token_type')->default('bearer');
            $table->text('scopes')->nullable();
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('github_repositories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('github_id')->unique();
            $table->string('name');
            $table->string('full_name')->unique();
            $table->string('owner');
            $table->text('description')->nullable();
            $table->string('html_url', 500);
            $table->string('default_branch')->default('main');
            $table->string('visibility', 16)->default('public');
            $table->string('language', 64)->nullable();
            $table->json('languages')->nullable();
            $table->json('topics')->nullable();
            $table->unsignedInteger('stars')->default(0);
            $table->unsignedInteger('forks')->default(0);
            $table->unsignedInteger('open_issues')->default(0);
            $table->unsignedInteger('size_kb')->default(0);
            $table->longText('readme')->nullable();
            $table->timestamp('readme_fetched_at')->nullable();
            $table->boolean('is_fork')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->string('status', 16)->default('pending');
            $table->boolean('is_featured')->default(false);
            $table->integer('display_order')->default(0);
            $table->timestamp('github_created_at')->nullable();
            $table->timestamp('github_updated_at')->nullable();
            $table->timestamp('github_pushed_at')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->text('last_sync_error')->nullable();
            $table->string('sync_source', 16)->default('manual');
            $table->timestamps();

            $table->index('status');
            $table->index('is_featured');
            $table->index('display_order');
            $table->index('language');
            $table->index('synced_at');
        });

        Schema::create('github_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('github_repository_id')->nullable()->constrained('github_repositories')->nullOnDelete();
            $table->string('action', 64);
            $table->string('status', 16);
            $table->text('message')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('visitor_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_key', 64)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip', 45)->nullable();
            $table->string('country', 8)->nullable();
            $table->string('city', 120)->nullable();
            $table->string('browser', 64)->nullable();
            $table->string('browser_version', 32)->nullable();
            $table->string('os', 64)->nullable();
            $table->string('device_type', 32)->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('is_bot')->default(false);
            $table->unsignedInteger('requests_count')->default(0);
            $table->unsignedInteger('pages_count')->default(0);
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            $table->index('ip');
            $table->index('last_activity_at');
            $table->index('user_id');
        });

        Schema::create('api_clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 64)->unique();
            $table->string('type', 24)->default('external_api');
            $table->string('token_hash', 64)->unique();
            $table->string('token_prefix', 16);
            $table->boolean('is_active')->default(true);
            $table->json('allowed_ips')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'type']);
        });

        Schema::create('request_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visitor_session_id')->nullable()->constrained('visitor_sessions')->nullOnDelete();
            $table->foreignId('api_client_id')->nullable()->constrained('api_clients')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source', 24)->default('unknown');
            $table->string('client_identifier', 128)->nullable();
            $table->string('method', 10);
            $table->string('endpoint', 255);
            $table->string('path', 255)->nullable();
            $table->unsignedSmallInteger('status')->default(0);
            $table->unsignedInteger('duration_ms')->default(0);
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('referer', 500)->nullable();
            $table->boolean('is_error')->default(false);
            $table->timestamp('created_at')->nullable();

            $table->index('created_at');
            $table->index(['source', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('ip');
        });

        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->string('level', 16)->default('info');
            $table->string('category', 24)->default('general');
            $table->text('message');
            $table->string('exception_class', 255)->nullable();
            $table->longText('stack_trace')->nullable();
            $table->string('source', 255)->nullable();
            $table->text('request_url')->nullable();
            $table->string('http_method', 10)->nullable();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['level', 'created_at']);
            $table->index(['category', 'created_at']);
            $table->index('occurred_at');
        });

        Schema::create('security_events', function (Blueprint $table) {
            $table->id();
            $table->string('type', 64);
            $table->string('severity', 16)->default('low');
            $table->text('description');
            $table->string('ip', 45)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['severity', 'created_at']);
            $table->index(['type', 'created_at']);
        });

        Schema::create('blocked_ips', function (Blueprint $table) {
            $table->id();
            $table->string('ip', 45)->unique();
            $table->text('reason')->nullable();
            $table->foreignId('blocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_permanent')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('unblocked_at')->nullable();
            $table->foreignId('unblocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
        });

        Schema::create('blocked_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->foreignId('blocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_permanent')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('unblocked_at')->nullable();
            $table->foreignId('unblocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 64);
            $table->string('target_type', 64)->nullable();
            $table->string('target_id', 64)->nullable();
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['action', 'created_at']);
            $table->index(['target_type', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('blocked_users');
        Schema::dropIfExists('blocked_ips');
        Schema::dropIfExists('security_events');
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('request_activities');
        Schema::dropIfExists('api_clients');
        Schema::dropIfExists('visitor_sessions');
        Schema::dropIfExists('github_sync_logs');
        Schema::dropIfExists('github_repositories');
        Schema::dropIfExists('github_accounts');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_admin', 'last_login_at']);
        });
    }
};
