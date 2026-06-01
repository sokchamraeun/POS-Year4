<?php

use App\Http\Controllers\Api\AddonController;
use App\Http\Controllers\Api\AddonIngredientController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\HeroSliderController;
use App\Http\Controllers\Api\IceLevelController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\InventoryTransactionController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentCheckoutController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\SugarLevelController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Health check (keep-alive for Render free tier)
Route::get('/health', fn () => response()->json(['status' => 'ok', 'time' => now()->toISOString()]));

// Public auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/customer/register', [CustomerAuthController::class, 'register']);
Route::post('/customer/login', [CustomerAuthController::class, 'login']);
Route::post('/customer/forgot-password', [CustomerAuthController::class, 'forgotPassword']);

// Customer-facing public routes (no auth required)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/tables/available', [TableController::class, 'available']);
Route::post('/orders', [OrderController::class, 'store']);
Route::post('/orders/check-stock', [OrderController::class, 'checkStock']);
Route::get('/orders/history', [OrderController::class, 'customerHistory']);
Route::get('/orders/user-history', [OrderController::class, 'userHistory']);
Route::get('/orders/{order}', [OrderController::class, 'show']);
Route::get('/tables', [TableController::class, 'index']);
Route::get('/hero-sliders', [HeroSliderController::class, 'index']);
Route::get('/orders/{order}/khqr-qr', [OrderController::class, 'generateKhqrQr']);
Route::post('/orders/payment/initiate', [PaymentCheckoutController::class, 'initiate']);
Route::match(['get', 'post'], '/orders/payment/callback', [PaymentCheckoutController::class, 'callback']);
// Public customer routes (for guest checkout)
Route::get('/customers', [CustomerController::class, 'index']);
Route::post('/customers', [CustomerController::class, 'store']);
Route::put('/customers/{customer}', [CustomerController::class, 'update']);

// Protected routes (staff + customer auth)
Route::middleware('auth:sanctum')->group(function () {
    // Staff auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Customer auth
    Route::post('/customer/logout', [CustomerAuthController::class, 'logout']);
    Route::get('/customer/me', [CustomerAuthController::class, 'me']);

    // Staff management
    Route::middleware('permission:manage-staff')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    Route::middleware('permission:manage-roles')->group(function () {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
    });

    Route::middleware('permission:manage-permissions')->group(function () {
        Route::get('/permissions', [PermissionController::class, 'index']);
        Route::get('/permissions/{permission}', [PermissionController::class, 'show']);
        Route::post('/permissions', [PermissionController::class, 'store']);
        Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
        Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);
    });

    Route::middleware('permission:view-size')->group(function () {
        Route::get('/sizes', [SizeController::class, 'index']);
        Route::get('/sizes/{size}', [SizeController::class, 'show']);
    });
    Route::middleware('permission:view-sugar-level')->group(function () {
        Route::get('/sugar-levels', [SugarLevelController::class, 'index']);
        Route::get('/sugar-levels/{sugarLevel}', [SugarLevelController::class, 'show']);
    });
    Route::middleware('permission:view-ice-level')->group(function () {
        Route::get('/ice-levels', [IceLevelController::class, 'index']);
        Route::get('/ice-levels/{iceLevel}', [IceLevelController::class, 'show']);
    });
    Route::middleware('permission:view-category')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
    });
    Route::middleware('permission:view-addon')->group(function () {
        Route::get('/addons', [AddonController::class, 'index']);
        Route::get('/addons/{addon}', [AddonController::class, 'show']);
    });
    Route::middleware('permission:view-ingredient')->group(function () {
        Route::get('/ingredients', [IngredientController::class, 'index']);
        Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show']);
    });
    Route::middleware('permission:view-recipe')->group(function () {
        Route::get('/recipes', [RecipeController::class, 'index']);
        Route::get('/recipes/{recipe}', [RecipeController::class, 'show']);
    });
    Route::middleware('permission:view-table')->group(function () {
        Route::get('/tables/{table}', [TableController::class, 'show']);
    });
    Route::middleware('permission:view-hero-slider')->group(function () {
        Route::get('/hero-sliders/{heroSlider}', [HeroSliderController::class, 'show']);
    });
    Route::middleware('permission:view-promotion')->group(function () {
        Route::get('/promotions', [PromotionController::class, 'index']);
        Route::get('/promotions/{promotion}', [PromotionController::class, 'show']);
    });

    Route::middleware('permission:create-size')->group(function () {
        Route::post('/sizes', [SizeController::class, 'store']);
    });
    Route::middleware('permission:edit-size')->group(function () {
        Route::put('/sizes/{size}', [SizeController::class, 'update']);
    });
    Route::middleware('permission:delete-size')->group(function () {
        Route::delete('/sizes/{size}', [SizeController::class, 'destroy']);
    });

    Route::middleware('permission:create-sugar-level')->group(function () {
        Route::post('/sugar-levels', [SugarLevelController::class, 'store']);
    });
    Route::middleware('permission:edit-sugar-level')->group(function () {
        Route::put('/sugar-levels/{sugarLevel}', [SugarLevelController::class, 'update']);
    });
    Route::middleware('permission:delete-sugar-level')->group(function () {
        Route::delete('/sugar-levels/{sugarLevel}', [SugarLevelController::class, 'destroy']);
    });

    Route::middleware('permission:create-ice-level')->group(function () {
        Route::post('/ice-levels', [IceLevelController::class, 'store']);
    });
    Route::middleware('permission:edit-ice-level')->group(function () {
        Route::put('/ice-levels/{iceLevel}', [IceLevelController::class, 'update']);
    });
    Route::middleware('permission:delete-ice-level')->group(function () {
        Route::delete('/ice-levels/{iceLevel}', [IceLevelController::class, 'destroy']);
    });

    Route::middleware('permission:create-category')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
    });
    Route::middleware('permission:edit-category')->group(function () {
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
    });
    Route::middleware('permission:delete-category')->group(function () {
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    Route::middleware('permission:create-addon')->group(function () {
        Route::post('/addons', [AddonController::class, 'store']);
    });
    Route::middleware('permission:edit-addon')->group(function () {
        Route::put('/addons/{addon}', [AddonController::class, 'update']);
    });
    Route::middleware('permission:delete-addon')->group(function () {
        Route::delete('/addons/{addon}', [AddonController::class, 'destroy']);
    });

    Route::middleware('permission:manage-ingredients,manage-staff')->group(function () {
        Route::get('/addon-ingredients', [AddonIngredientController::class, 'index']);
        Route::post('/addon-ingredients', [AddonIngredientController::class, 'store']);
        Route::put('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'update']);
        Route::delete('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'destroy']);
    });

    // Staff product management
    Route::middleware('permission:create-product')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
    });
    Route::middleware('permission:edit-product')->group(function () {
        Route::put('/products/{product}', [ProductController::class, 'update']);
    });
    Route::middleware('permission:delete-product')->group(function () {
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });

    // Customer management (staff)
    Route::middleware('permission:manage-customers')->group(function () {
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
    });

    // Staff order management
    Route::middleware('permission:view-orders')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
    });
    Route::middleware('permission:manage-orders')->group(function () {
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
        Route::post('/orders/{order}/mark-printed', [OrderController::class, 'markPrinted']);
    });

    // Table management (staff)
    Route::middleware('permission:create-table')->group(function () {
        Route::post('/tables', [TableController::class, 'store']);
    });
    Route::middleware('permission:edit-table')->group(function () {
        Route::put('/tables/{table}', [TableController::class, 'update']);
    });
    Route::middleware('permission:delete-table')->group(function () {
        Route::delete('/tables/{table}', [TableController::class, 'destroy']);
    });

    // Hero Slider management (staff)
    Route::middleware('permission:create-hero-slider')->group(function () {
        Route::post('/hero-sliders', [HeroSliderController::class, 'store']);
    });
    Route::middleware('permission:edit-hero-slider')->group(function () {
        Route::put('/hero-sliders/{heroSlider}', [HeroSliderController::class, 'update']);
    });
    Route::middleware('permission:delete-hero-slider')->group(function () {
        Route::delete('/hero-sliders/{heroSlider}', [HeroSliderController::class, 'destroy']);
    });

    // Promotion management (staff)
    Route::middleware('permission:create-promotion')->group(function () {
        Route::post('/promotions', [PromotionController::class, 'store']);
    });
    Route::middleware('permission:edit-promotion')->group(function () {
        Route::put('/promotions/{promotion}', [PromotionController::class, 'update']);
    });
    Route::middleware('permission:delete-promotion')->group(function () {
        Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy']);
    });

    // Ingredient management (staff)
    Route::middleware('permission:create-ingredient')->group(function () {
        Route::post('/ingredients', [IngredientController::class, 'store']);
    });
    Route::middleware('permission:edit-ingredient')->group(function () {
        Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update']);
    });
    Route::middleware('permission:delete-ingredient')->group(function () {
        Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy']);
    });

    // Recipe management (staff)
    Route::middleware('permission:create-recipe')->group(function () {
        Route::post('/recipes', [RecipeController::class, 'store']);
        Route::post('/recipes/batch-update', [RecipeController::class, 'batchUpdate']);
    });
    Route::middleware('permission:edit-recipe')->group(function () {
        Route::put('/recipes/{recipe}', [RecipeController::class, 'update']);
    });
    Route::middleware('permission:delete-recipe')->group(function () {
        Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy']);
    });

    Route::middleware('permission:manage-inventory,manage-staff')->group(function () {
        Route::get('/inventory-transactions', [InventoryTransactionController::class, 'index']);
        Route::get('/inventory-transactions/{inventoryTransaction}', [InventoryTransactionController::class, 'show']);
        Route::post('/inventory-transactions', [InventoryTransactionController::class, 'store']);
        Route::delete('/inventory-transactions/{inventoryTransaction}', [InventoryTransactionController::class, 'destroy']);
    });

    Route::middleware('permission:view-reports,manage-staff')->prefix('reports')->group(function () {
        Route::get('/sales', [ReportController::class, 'sales']);
        Route::get('/products', [ReportController::class, 'products']);
        Route::get('/inventory', [ReportController::class, 'inventory']);
        Route::get('/purchases', [ReportController::class, 'purchases']);
        Route::get('/profit', [ReportController::class, 'profit']);
        Route::get('/customers', [ReportController::class, 'customers']);
        Route::get('/payments', [ReportController::class, 'payments']);
    });
});
