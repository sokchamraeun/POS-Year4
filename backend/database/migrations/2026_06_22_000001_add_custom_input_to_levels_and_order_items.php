<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sugar_levels', function (Blueprint $table) {
            $table->boolean('requires_input')->default(false)->after('name');
        });

        Schema::table('ice_levels', function (Blueprint $table) {
            $table->boolean('requires_input')->default(false)->after('name');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('sugar_note')->nullable()->after('sugar_level_id');
            $table->string('ice_note')->nullable()->after('ice_level_id');
        });
    }

    public function down(): void
    {
        Schema::table('sugar_levels', function (Blueprint $table) {
            $table->dropColumn('requires_input');
        });

        Schema::table('ice_levels', function (Blueprint $table) {
            $table->dropColumn('requires_input');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['sugar_note', 'ice_note']);
        });
    }
};
