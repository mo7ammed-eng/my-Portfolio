<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::create('hero_sections', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('ghost_line');
            $table->string('name_line');
            $table->text('paragraph1')->nullable();
            $table->text('paragraph2')->nullable();
            $table->text('paragraph3')->nullable();
            $table->string('cta_text')->nullable();
            $table->boolean('visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('about_sections', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('heading_line1');
            $table->string('heading_line2');
            $table->string('heading_line3');
            $table->json('bio')->nullable();
            $table->string('resume_url')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });

        Schema::create('skill_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('label')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });

        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('role');
            $table->string('company')->nullable();
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->integer('sort_order')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('num');
            $table->string('label');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('href')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('visible')->default(true);
            $table->timestamps();
        });

        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->string('platform')->unique();
            $table->string('label');
            $table->string('url')->nullable();
            $table->boolean('visible')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('seo_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::create('theme_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_settings');
        Schema::dropIfExists('seo_settings');
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('services');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('skill_categories');
        Schema::dropIfExists('about_sections');
        Schema::dropIfExists('hero_sections');
        Schema::dropIfExists('site_settings');
    }
};
