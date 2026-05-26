<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index('status');
            $table->index('payment_status');
            $table->index('payment_method');
            $table->index('payment_reference');
            $table->index('created_at');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('size_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->index('phone');
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->index('type');
            $table->index('created_at');
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->index('ingredient_id');
        });

        Schema::table('addon_ingredients', function (Blueprint $table) {
            $table->index('ingredient_id');
        });

        Schema::table('product_addon_size_prices', function (Blueprint $table) {
            $table->index('addon_id');
            $table->index('size_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['payment_status']);
            $table->dropIndex(['payment_method']);
            $table->dropIndex(['payment_reference']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['size_id']);
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex(['phone']);
        });

        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('recipes', function (Blueprint $table) {
            $table->dropIndex(['ingredient_id']);
        });

        Schema::table('addon_ingredients', function (Blueprint $table) {
            $table->dropIndex(['ingredient_id']);
        });

        Schema::table('product_addon_size_prices', function (Blueprint $table) {
            $table->dropIndex(['addon_id']);
            $table->dropIndex(['size_id']);
        });
    }
};
