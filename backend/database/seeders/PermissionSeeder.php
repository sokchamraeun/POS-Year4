<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        Permission::insert([
            ['name' => 'Create Product', 'slug' => 'create-product', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Edit Product', 'slug' => 'edit-product', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Delete Product', 'slug' => 'delete-product', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'View Orders', 'slug' => 'view-orders', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Manage Staff', 'slug' => 'manage-staff', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
