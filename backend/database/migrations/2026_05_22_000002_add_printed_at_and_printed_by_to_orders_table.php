<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dateTime('printed_at')->nullable()->after('is_printed');
            $table->foreignId('printed_by')->nullable()->constrained('users')->nullOnDelete()->after('printed_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('printed_by');
            $table->dropColumn('printed_at');
        });
    }
};
