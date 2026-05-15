<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::insert([
            ['id' => 1, 'name' => 'Admin', 'slug' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Manage', 'slug' => 'manage', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Staff', 'slug' => 'staff', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
