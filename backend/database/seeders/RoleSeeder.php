<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Clean orphaned roles (ids > 3 that no longer exist in seeder)
        Role::where('id', '>', 3)->each(fn ($r) => $r->permissions()->detach());
        Role::where('id', '>', 3)->delete();

        $admin = Role::firstOrCreate(['slug' => 'admin'], ['id' => 1, 'name' => 'Admin']);
        $manage = Role::firstOrCreate(['slug' => 'manage'], ['id' => 2, 'name' => 'Manage']);
        $staff = Role::firstOrCreate(['slug' => 'staff'], ['id' => 3, 'name' => 'Staff']);

        $allPermIds = Permission::pluck('id');

        // Admin gets ALL permissions
        $admin->permissions()->sync($allPermIds);

        // Manage gets most permissions except role/permission management
        $manage->permissions()->sync(
            Permission::whereNotIn('slug', [
                'manage-roles',
                'manage-permissions',
                'manage-staff',
                'delete-product',
                'delete-category',
                'delete-size',
                'delete-sugar-level',
                'delete-ice-level',
                'delete-addon',
                'delete-table',
                'delete-hero-slider',
                'delete-promotion',
                'delete-ingredient',
                'delete-recipe',
            ])->pluck('id')
        );

        // Staff gets view + basic create permissions
        $staff->permissions()->sync(
            Permission::whereIn('slug', [
                'view-orders',
                'view-product',
                'view-category',
                'view-size',
                'view-sugar-level',
                'view-ice-level',
                'view-addon',
                'view-table',
                'view-promotion',
                'view-ingredient',
                'view-recipe',
                'create-category',
                'create-product',
                'create-size',
                'create-sugar-level',
                'create-ice-level',
                'create-addon',
                'create-table',
                'create-promotion',
                'create-ingredient',
                'create-recipe',
            ])->pluck('id')
        );
    }
}
