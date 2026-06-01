<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Categories
            ['name' => 'View Category', 'slug' => 'view-category'],
            ['name' => 'Create Category', 'slug' => 'create-category'],
            ['name' => 'Edit Category', 'slug' => 'edit-category'],
            ['name' => 'Delete Category', 'slug' => 'delete-category'],
            // Products
            ['name' => 'View Product', 'slug' => 'view-product'],
            ['name' => 'Create Product', 'slug' => 'create-product'],
            ['name' => 'Edit Product', 'slug' => 'edit-product'],
            ['name' => 'Delete Product', 'slug' => 'delete-product'],
            // Sizes
            ['name' => 'View Size', 'slug' => 'view-size'],
            ['name' => 'Create Size', 'slug' => 'create-size'],
            ['name' => 'Edit Size', 'slug' => 'edit-size'],
            ['name' => 'Delete Size', 'slug' => 'delete-size'],
            // Sugar Levels
            ['name' => 'View Sugar Level', 'slug' => 'view-sugar-level'],
            ['name' => 'Create Sugar Level', 'slug' => 'create-sugar-level'],
            ['name' => 'Edit Sugar Level', 'slug' => 'edit-sugar-level'],
            ['name' => 'Delete Sugar Level', 'slug' => 'delete-sugar-level'],
            // Ice Levels
            ['name' => 'View Ice Level', 'slug' => 'view-ice-level'],
            ['name' => 'Create Ice Level', 'slug' => 'create-ice-level'],
            ['name' => 'Edit Ice Level', 'slug' => 'edit-ice-level'],
            ['name' => 'Delete Ice Level', 'slug' => 'delete-ice-level'],
            // Addons
            ['name' => 'View Addon', 'slug' => 'view-addon'],
            ['name' => 'Create Addon', 'slug' => 'create-addon'],
            ['name' => 'Edit Addon', 'slug' => 'edit-addon'],
            ['name' => 'Delete Addon', 'slug' => 'delete-addon'],
            // Tables
            ['name' => 'View Table', 'slug' => 'view-table'],
            ['name' => 'Create Table', 'slug' => 'create-table'],
            ['name' => 'Edit Table', 'slug' => 'edit-table'],
            ['name' => 'Delete Table', 'slug' => 'delete-table'],
            // Hero Sliders
            ['name' => 'View Hero Slider', 'slug' => 'view-hero-slider'],
            ['name' => 'Create Hero Slider', 'slug' => 'create-hero-slider'],
            ['name' => 'Edit Hero Slider', 'slug' => 'edit-hero-slider'],
            ['name' => 'Delete Hero Slider', 'slug' => 'delete-hero-slider'],
            // Promotions
            ['name' => 'View Promotion', 'slug' => 'view-promotion'],
            ['name' => 'Create Promotion', 'slug' => 'create-promotion'],
            ['name' => 'Edit Promotion', 'slug' => 'edit-promotion'],
            ['name' => 'Delete Promotion', 'slug' => 'delete-promotion'],
            // Ingredients
            ['name' => 'View Ingredient', 'slug' => 'view-ingredient'],
            ['name' => 'Create Ingredient', 'slug' => 'create-ingredient'],
            ['name' => 'Edit Ingredient', 'slug' => 'edit-ingredient'],
            ['name' => 'Delete Ingredient', 'slug' => 'delete-ingredient'],
            // Recipes
            ['name' => 'View Recipe', 'slug' => 'view-recipe'],
            ['name' => 'Create Recipe', 'slug' => 'create-recipe'],
            ['name' => 'Edit Recipe', 'slug' => 'edit-recipe'],
            ['name' => 'Delete Recipe', 'slug' => 'delete-recipe'],
            // Inventory
            ['name' => 'Manage Inventory', 'slug' => 'manage-inventory'],
            // Orders
            ['name' => 'View Orders', 'slug' => 'view-orders'],
            ['name' => 'Manage Orders', 'slug' => 'manage-orders'],
            // Reports
            ['name' => 'View Reports', 'slug' => 'view-reports'],
            // Staff & Customers
            ['name' => 'Manage Staff', 'slug' => 'manage-staff'],
            ['name' => 'Manage Customers', 'slug' => 'manage-customers'],
            // Roles & Permissions
            ['name' => 'Manage Roles', 'slug' => 'manage-roles'],
            ['name' => 'Manage Permissions', 'slug' => 'manage-permissions'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                ['name' => $perm['name'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
