<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('page')->nullable();
            $table->string('referrer')->nullable();
            $table->string('useragent')->nullable();
            $table->string('ip')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('source')->nullable();
            $table->timestamps();
        });

        Schema::create('ad_clicks', function (Blueprint $table) {
            $table->id();
            $table->string('label')->nullable();
            $table->string('url')->nullable();
            $table->string('page')->nullable();
            $table->timestamps();
        });

        Schema::create('searches', function (Blueprint $table) {
            $table->id();
            $table->string('query');
            $table->unsignedInteger('count')->default(1);
            $table->timestamp('last_searched')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('searches');
        Schema::dropIfExists('ad_clicks');
        Schema::dropIfExists('visits');
    }
};
