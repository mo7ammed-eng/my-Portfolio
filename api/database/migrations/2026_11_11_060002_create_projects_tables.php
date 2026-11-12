<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('category')->default('Website');
            $table->string('tech')->nullable();
            $table->string('image_url')->nullable();
            $table->string('link')->nullable();
            $table->string('github_url')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('client')->nullable();
            $table->string('month')->nullable();
            $table->string('year')->nullable();
            $table->string('services')->nullable();
            $table->text('review')->nullable();
            $table->string('logo_full_view_url')->nullable();
            $table->string('desktop_view_url')->nullable();
            $table->string('phone_view_url')->nullable();
            $table->string('mobile_image_url')->nullable();
            $table->json('gallery')->nullable();
            $table->date('project_date')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('type')->default('gallery');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_images');
        Schema::dropIfExists('projects');
    }
};
