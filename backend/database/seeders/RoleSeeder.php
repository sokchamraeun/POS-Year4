<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['id' => 1, 'name' => 'Admin', 'slug' => 'admin'],
            ['id' => 2, 'name' => 'Manage', 'slug' => 'manage'],
            ['id' => 3, 'name' => 'Staff', 'slug' => 'staff'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug']],
                ['id' => $role['id'], 'name' => $role['name']]
            );
        }
    }
}
