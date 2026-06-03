<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['sugar_level_id']);
            $table->dropForeign(['ice_level_id']);

            $table->foreign('sugar_level_id')->references('id')->on('sugar_levels')->nullOnDelete();
            $table->foreign('ice_level_id')->references('id')->on('ice_levels')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['sugar_level_id']);
            $table->dropForeign(['ice_level_id']);

            $table->foreign('sugar_level_id')->references('id')->on('sugar_levels');
            $table->foreign('ice_level_id')->references('id')->on('ice_levels');
        });
    }
};
