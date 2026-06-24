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
            ['name' => 'View Category', 'slug' => 'view-category', 'module' => 'Categories'],
            ['name' => 'Create Category', 'slug' => 'create-category', 'module' => 'Categories'],
            ['name' => 'Edit Category', 'slug' => 'edit-category', 'module' => 'Categories'],
            ['name' => 'Delete Category', 'slug' => 'delete-category', 'module' => 'Categories'],
            // Products
            ['name' => 'View Product', 'slug' => 'view-product', 'module' => 'Products'],
            ['name' => 'Create Product', 'slug' => 'create-product', 'module' => 'Products'],
            ['name' => 'Edit Product', 'slug' => 'edit-product', 'module' => 'Products'],
            ['name' => 'Delete Product', 'slug' => 'delete-product', 'module' => 'Products'],
            // Sizes
            ['name' => 'View Size', 'slug' => 'view-size', 'module' => 'Sizes'],
            ['name' => 'Create Size', 'slug' => 'create-size', 'module' => 'Sizes'],
            ['name' => 'Edit Size', 'slug' => 'edit-size', 'module' => 'Sizes'],
            ['name' => 'Delete Size', 'slug' => 'delete-size', 'module' => 'Sizes'],
            // Sugar Levels
            ['name' => 'View Sugar Level', 'slug' => 'view-sugar-level', 'module' => 'Sugar Levels'],
            ['name' => 'Create Sugar Level', 'slug' => 'create-sugar-level', 'module' => 'Sugar Levels'],
            ['name' => 'Edit Sugar Level', 'slug' => 'edit-sugar-level', 'module' => 'Sugar Levels'],
            ['name' => 'Delete Sugar Level', 'slug' => 'delete-sugar-level', 'module' => 'Sugar Levels'],
            // Ice Levels
            ['name' => 'View Ice Level', 'slug' => 'view-ice-level', 'module' => 'Ice Levels'],
            ['name' => 'Create Ice Level', 'slug' => 'create-ice-level', 'module' => 'Ice Levels'],
            ['name' => 'Edit Ice Level', 'slug' => 'edit-ice-level', 'module' => 'Ice Levels'],
            ['name' => 'Delete Ice Level', 'slug' => 'delete-ice-level', 'module' => 'Ice Levels'],
            // Addons
            ['name' => 'View Addon', 'slug' => 'view-addon', 'module' => 'Addons'],
            ['name' => 'Create Addon', 'slug' => 'create-addon', 'module' => 'Addons'],
            ['name' => 'Edit Addon', 'slug' => 'edit-addon', 'module' => 'Addons'],
            ['name' => 'Delete Addon', 'slug' => 'delete-addon', 'module' => 'Addons'],
            // Tables
            ['name' => 'View Table', 'slug' => 'view-table', 'module' => 'Tables'],
            ['name' => 'Create Table', 'slug' => 'create-table', 'module' => 'Tables'],
            ['name' => 'Edit Table', 'slug' => 'edit-table', 'module' => 'Tables'],
            ['name' => 'Delete Table', 'slug' => 'delete-table', 'module' => 'Tables'],
            // Hero Sliders
            ['name' => 'View Hero Slider', 'slug' => 'view-hero-slider', 'module' => 'Hero Sliders'],
            ['name' => 'Create Hero Slider', 'slug' => 'create-hero-slider', 'module' => 'Hero Sliders'],
            ['name' => 'Edit Hero Slider', 'slug' => 'edit-hero-slider', 'module' => 'Hero Sliders'],
            ['name' => 'Delete Hero Slider', 'slug' => 'delete-hero-slider', 'module' => 'Hero Sliders'],
            // Promotions
            ['name' => 'View Promotion', 'slug' => 'view-promotion', 'module' => 'Promotions'],
            ['name' => 'Create Promotion', 'slug' => 'create-promotion', 'module' => 'Promotions'],
            ['name' => 'Edit Promotion', 'slug' => 'edit-promotion', 'module' => 'Promotions'],
            ['name' => 'Delete Promotion', 'slug' => 'delete-promotion', 'module' => 'Promotions'],
            // Ingredients
            ['name' => 'View Ingredient', 'slug' => 'view-ingredient', 'module' => 'Ingredients'],
            ['name' => 'Create Ingredient', 'slug' => 'create-ingredient', 'module' => 'Ingredients'],
            ['name' => 'Edit Ingredient', 'slug' => 'edit-ingredient', 'module' => 'Ingredients'],
            ['name' => 'Delete Ingredient', 'slug' => 'delete-ingredient', 'module' => 'Ingredients'],
            // Recipes
            ['name' => 'View Recipe', 'slug' => 'view-recipe', 'module' => 'Recipe'],
            ['name' => 'Create Recipe', 'slug' => 'create-recipe', 'module' => 'Recipe'],
            ['name' => 'Edit Recipe', 'slug' => 'edit-recipe', 'module' => 'Recipe'],
            ['name' => 'Delete Recipe', 'slug' => 'delete-recipe', 'module' => 'Recipe'],
            // Inventory
            ['name' => 'Manage Inventory', 'slug' => 'manage-inventory', 'module' => 'Inventory'],
            // Orders
            ['name' => 'View Orders', 'slug' => 'view-orders', 'module' => 'Orders'],
            ['name' => 'Manage Orders', 'slug' => 'manage-orders', 'module' => 'Orders'],
            // Reports
            ['name' => 'View Reports', 'slug' => 'view-reports', 'module' => 'Reports'],
            // Staff & Customers
            ['name' => 'Manage Staff', 'slug' => 'manage-staff', 'module' => 'Staff'],
            ['name' => 'Manage Customers', 'slug' => 'manage-customers', 'module' => 'Customers'],
            // Roles & Permissions
            ['name' => 'Manage Roles', 'slug' => 'manage-roles', 'module' => 'Roles'],
            ['name' => 'Manage Permissions', 'slug' => 'manage-permissions', 'module' => 'Permissions'],

            // Events
            ['name' => 'View Event', 'slug' => 'view-event', 'module' => 'Events'],
            ['name' => 'Create Event', 'slug' => 'create-event', 'module' => 'Events'],
            ['name' => 'Edit Event', 'slug' => 'edit-event', 'module' => 'Events'],
            ['name' => 'Delete Event', 'slug' => 'delete-event', 'module' => 'Events'],
            ['name' => 'Manage Events', 'slug' => 'manage-events', 'module' => 'Events'],

            // Settings
            ['name' => 'Manage Settings', 'slug' => 'manage-settings', 'module' => 'Settings'],

            // Suppliers
            ['name' => 'View Supplier', 'slug' => 'view-supplier', 'module' => 'Suppliers'],
            ['name' => 'Create Supplier', 'slug' => 'create-supplier', 'module' => 'Suppliers'],
            ['name' => 'Edit Supplier', 'slug' => 'edit-supplier', 'module' => 'Suppliers'],
            ['name' => 'Delete Supplier', 'slug' => 'delete-supplier', 'module' => 'Suppliers'],

            // Purchase Orders
            ['name' => 'View Purchase Order', 'slug' => 'view-purchase-order', 'module' => 'Purchase Orders'],
            ['name' => 'Create Purchase Order', 'slug' => 'create-purchase-order', 'module' => 'Purchase Orders'],
            ['name' => 'Edit Purchase Order', 'slug' => 'edit-purchase-order', 'module' => 'Purchase Orders'],
            ['name' => 'Delete Purchase Order', 'slug' => 'delete-purchase-order', 'module' => 'Purchase Orders'],

            // Inventory Transactions
            ['name' => 'Manage Inventory Transactions', 'slug' => 'manage-inventory-transactions', 'module' => 'Inventory'],

            // Log History
            ['name' => 'View Login History', 'slug' => 'view-login-history', 'module' => 'Log History'],

            // Employees
            ['name' => 'View Employee', 'slug' => 'view-employee', 'module' => 'Employees'],
            ['name' => 'Create Employee', 'slug' => 'create-employee', 'module' => 'Employees'],
            ['name' => 'Edit Employee', 'slug' => 'edit-employee', 'module' => 'Employees'],
            ['name' => 'Delete Employee', 'slug' => 'delete-employee', 'module' => 'Employees'],

            // Dashboard
            ['name' => 'View Dashboard', 'slug' => 'view-dashboard', 'module' => 'Dashboard'],

            // Addon Ingredients
            ['name' => 'Manage Ingredients', 'slug' => 'manage-ingredients', 'module' => 'Addon Ingredients'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(
                ['slug' => $perm['slug']],
                ['name' => $perm['name'], 'module' => $perm['module'], 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
