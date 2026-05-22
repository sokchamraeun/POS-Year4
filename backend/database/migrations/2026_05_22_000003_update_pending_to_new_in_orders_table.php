<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')
            ->where('status', 'Pending')
            ->update(['status' => 'New']);
    }

    public function down(): void
    {
        DB::table('orders')
            ->where('status', 'New')
            ->update(['status' => 'Pending']);
    }
};
