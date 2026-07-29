<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // PermissionSeeder is idempotent (firstOrCreate by slug), so running it
            // on every deploy safely adds new permissions without duplicating.
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            IngredientAndRecipeSeeder::class,
        ]);

        // Make sure the Admin role always has every permission (including newly
        // added ones) without detaching existing assignments or touching other roles.
        $admin = Role::where('slug', 'admin')->first();
        if ($admin) {
            $admin->permissions()->syncWithoutDetaching(Permission::pluck('id'));
        }
    }
}
