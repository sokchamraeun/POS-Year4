<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('hours_weekday')->nullable()->after('footer_email');
            $table->string('hours_saturday')->nullable()->after('hours_weekday');
            $table->string('hours_sunday')->nullable()->after('hours_saturday');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['hours_weekday', 'hours_saturday', 'hours_sunday']);
        });
    }
};
