<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_type_check');
            DB::statement("ALTER TABLE promotions ADD CONSTRAINT promotions_type_check CHECK (type IN ('percentage','fixed_amount','buy_x_get_y','combo','combo_discount'))");
        }

        Schema::table('promotions', function (Blueprint $table) {
            $table->string('combo_discount_type', 20)->nullable()->after('free_qty');
            $table->string('combo_apply_to', 20)->nullable()->after('combo_discount_type');
            $table->json('combo_groups')->nullable()->after('combo_apply_to');
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropColumn(['combo_groups', 'combo_apply_to', 'combo_discount_type']);
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE promotions DROP CONSTRAINT IF EXISTS promotions_type_check');
            DB::statement("ALTER TABLE promotions ADD CONSTRAINT promotions_type_check CHECK (type IN ('percentage','fixed_amount','buy_x_get_y','combo'))");
        }
    }
};
