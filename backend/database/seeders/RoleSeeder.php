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

        // Manage gets all permissions except admin-only and delete-*
        $manage->permissions()->sync(
            Permission::whereNotIn('slug', [
                'manage-roles',
                'manage-permissions',
                'manage-staff',
            ])->where('slug', 'not like', 'delete-%')
                ->pluck('id')
        );

        // Staff gets all view-* (except sensitive) and all create-* permissions
        $staff->permissions()->sync(
            Permission::where(function ($q) {
                $q->where('slug', 'like', 'view-%')
                    ->whereNotIn('slug', [
                        'view-login-history',
                        'view-employee',
                        'view-reports',
                    ]);
            })->orWhere(function ($q) {
                $q->where('slug', 'like', 'create-%');
            })->pluck('id')
        );
    }
}
