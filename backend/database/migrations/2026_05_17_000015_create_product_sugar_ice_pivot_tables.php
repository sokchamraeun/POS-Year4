<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('products', 'sugar_level_id') || Schema::hasColumn('products', 'ice_level_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn(['sugar_level_id', 'ice_level_id']);
            });
        }

        Schema::create('product_sugar_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sugar_level_id')->constrained()->cascadeOnDelete();
        });

        Schema::create('product_ice_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ice_level_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_ice_levels');
        Schema::dropIfExists('product_sugar_levels');

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('sugar_level_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ice_level_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
