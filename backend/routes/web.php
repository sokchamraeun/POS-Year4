<?php

use App\Http\Controllers\AddonIngredients\AddonIngredientController;
use App\Http\Controllers\Addons\AddonController;
use App\Http\Controllers\Auth\WebAuthController;
use App\Http\Controllers\Categories\CategoryController;
use App\Http\Controllers\Customer\CustomerOrderController;
use App\Http\Controllers\KHQR\KhqrTestController;
use App\Http\Controllers\Ingredients\IngredientController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Orders\OrderController;
use App\Http\Controllers\Permissions\PermissionController;
use App\Http\Controllers\Products\ProductController;
use App\Http\Controllers\Recipes\RecipeController;
use App\Http\Controllers\Roles\RoleController;
use App\Http\Controllers\Tables\TableController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WebAuthController::class, 'loginPage'])->name('auth.login');
Route::post('/', [WebAuthController::class, 'login'])->name('auth.login.post');

Route::get('/customer/order', [CustomerOrderController::class, 'showForm'])->name('customer.order.form');
Route::post('/customer/order', [CustomerOrderController::class, 'placeOrder'])->name('customer.order.place');
Route::get('/customer/order/{order}/confirmation', [CustomerOrderController::class, 'confirmation'])->name('customer.order.confirmation');
Route::post('/customer/order/webhook', [CustomerOrderController::class, 'webhook'])->name('customer.order.webhook');
Route::get('/khqr-test', [KhqrTestController::class, 'index'])->name('khqr.test');
Route::post('/khqr-test', [KhqrTestController::class, 'generate'])->name('khqr.test.generate');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [WebAuthController::class, 'logout'])->name('auth.logout');
    
    // Route::get('/', fn () => redirect()->route('auth.login.post'));
    
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::get('/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
    Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::get('/permissions/{permission}', [PermissionController::class, 'show'])->name('permissions.show');
    Route::get('/permissions/{permission}/edit', [PermissionController::class, 'edit'])->name('permissions.edit');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->name('permissions.update');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/addons', [AddonController::class, 'index'])->name('addons.index');
    Route::get('/addons/create', [AddonController::class, 'create'])->name('addons.create');
    Route::post('/addons', [AddonController::class, 'store'])->name('addons.store');
    Route::get('/addons/{addon}', [AddonController::class, 'show'])->name('addons.show');
    Route::get('/addons/{addon}/edit', [AddonController::class, 'edit'])->name('addons.edit');
    Route::put('/addons/{addon}', [AddonController::class, 'update'])->name('addons.update');
    Route::delete('/addons/{addon}', [AddonController::class, 'destroy'])->name('addons.destroy');

    Route::get('/addon-ingredients', [AddonIngredientController::class, 'index'])->name('addon-ingredients.index');
    Route::get('/addon-ingredients/create', [AddonIngredientController::class, 'create'])->name('addon-ingredients.create');
    Route::post('/addon-ingredients', [AddonIngredientController::class, 'store'])->name('addon-ingredients.store');
    Route::get('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'show'])->name('addon-ingredients.show');
    Route::get('/addon-ingredients/{addonIngredient}/edit', [AddonIngredientController::class, 'edit'])->name('addon-ingredients.edit');
    Route::put('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'update'])->name('addon-ingredients.update');
    Route::delete('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'destroy'])->name('addon-ingredients.destroy');

    Route::get('/tables', [TableController::class, 'index'])->name('tables.index');
    Route::get('/tables/create', [TableController::class, 'create'])->name('tables.create');
    Route::post('/tables', [TableController::class, 'store'])->name('tables.store');
    Route::get('/tables/{table}', [TableController::class, 'show'])->name('tables.show');
    Route::get('/tables/{table}/edit', [TableController::class, 'edit'])->name('tables.edit');
    Route::put('/tables/{table}', [TableController::class, 'update'])->name('tables.update');
    Route::delete('/tables/{table}', [TableController::class, 'destroy'])->name('tables.destroy');

    Route::get('/ingredients', [IngredientController::class, 'index'])->name('ingredients.index');
    Route::get('/ingredients/create', [IngredientController::class, 'create'])->name('ingredients.create');
    Route::post('/ingredients', [IngredientController::class, 'store'])->name('ingredients.store');
    Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show'])->name('ingredients.show');
    Route::get('/ingredients/{ingredient}/edit', [IngredientController::class, 'edit'])->name('ingredients.edit');
    Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update'])->name('ingredients.update');
    Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy'])->name('ingredients.destroy');

    Route::get('/recipes', [RecipeController::class, 'index'])->name('recipes.index');
    Route::get('/recipes/create', [RecipeController::class, 'create'])->name('recipes.create');
    Route::post('/recipes', [RecipeController::class, 'store'])->name('recipes.store');
    Route::get('/recipes/{product}/{size}/batch-edit', [RecipeController::class, 'batchEdit'])->name('recipes.batch-edit');
    Route::put('/recipes/batch-update', [RecipeController::class, 'batchUpdate'])->name('recipes.batch-update');
    Route::get('/recipes/{recipe}', [RecipeController::class, 'show'])->name('recipes.show');
    Route::get('/recipes/{recipe}/edit', [RecipeController::class, 'edit'])->name('recipes.edit');
    Route::put('/recipes/{recipe}', [RecipeController::class, 'update'])->name('recipes.update');
    Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/history', [InventoryController::class, 'history'])->name('inventory.history');
});
