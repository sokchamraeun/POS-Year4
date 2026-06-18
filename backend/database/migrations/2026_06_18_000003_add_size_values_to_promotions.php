<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            // Per-size discount overrides: { "<size_id>": <value>, ... }
            // When a size is absent, the base `value` column is used.
            $table->json('size_values')->nullable()->after('value');
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropColumn('size_values');
        });
    }
};
