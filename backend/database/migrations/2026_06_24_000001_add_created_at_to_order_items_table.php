<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Records when each item was added, so an order built up over time
            // (e.g. first items at 9:00pm, more at 9:10pm) shows per-item times.
            $table->timestamp('created_at')->nullable()->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });
    }
};
