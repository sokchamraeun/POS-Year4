<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->foreignId('size_id')->nullable()->after('product_id')
                  ->constrained()->cascadeOnDelete();

            $table->dropUnique('recipes_product_id_ingredient_id_unique');

            $table->unique(['product_id', 'size_id', 'ingredient_id']);
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropForeign(['size_id']);
            $table->dropColumn('size_id');

            $table->dropUnique('recipes_product_id_size_id_ingredient_id_unique');

            $table->unique(['product_id', 'ingredient_id']);
        });
    }
};
