<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('receipt_shop_name')->nullable()->after('footer_email');
            $table->string('receipt_location')->nullable()->after('receipt_shop_name');
            $table->string('receipt_wifi_name')->nullable()->after('receipt_location');
            $table->string('receipt_wifi_password')->nullable()->after('receipt_wifi_name');
            $table->decimal('receipt_exchange_rate', 10, 2)->default(4100)->after('receipt_wifi_password');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'receipt_shop_name',
                'receipt_location',
                'receipt_wifi_name',
                'receipt_wifi_password',
                'receipt_exchange_rate',
            ]);
        });
    }
};
