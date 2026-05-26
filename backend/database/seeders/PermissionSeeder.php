<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'Create Product', 'slug' => 'create-product'],
            ['name' => 'Edit Product', 'slug' => 'edit-product'],
            ['name' => 'Delete Product', 'slug' => 'delete-product'],
            ['name' => 'View Orders', 'slug' => 'view-orders'],
            ['name' => 'Manage Staff', 'slug' => 'manage-staff'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                ['name' => $perm['name']]
            );
        }
    }
}
