<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix PostgreSQL sequence for role_permissions table
        DB::statement('SELECT setval(\'role_permissions_id_seq\', GREATEST(COALESCE((SELECT MAX(id) FROM role_permissions), 0), 1))');
    }

    public function down(): void
    {
        // No need to revert
    }
};
