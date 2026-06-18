<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('The Bird Nest');
            $table->string('tagline')->nullable();
            $table->string('logo')->nullable();
            $table->string('footer_location')->nullable();
            $table->string('footer_phone')->nullable();
            $table->string('footer_email')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
