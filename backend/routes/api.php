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
// Protected routes (staff + customer auth)
Route::middleware('auth:sanctum')->group(function () {
    // Staff auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Customer auth
    Route::post('/customer/logout', [CustomerAuthController::class, 'logout']);
    Route::get('/customer/me', [CustomerAuthController::class, 'me']);

    // Staff management
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/roles/{role}', [RoleController::class, 'show']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{role}', [RoleController::class, 'update']);
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::get('/permissions/{permission}', [PermissionController::class, 'show']);
    Route::post('/permissions', [PermissionController::class, 'store']);
    Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);

    Route::get('/sizes', [SizeController::class, 'index']);
    Route::get('/sizes/{size}', [SizeController::class, 'show']);
    Route::post('/sizes', [SizeController::class, 'store']);
    Route::put('/sizes/{size}', [SizeController::class, 'update']);
    Route::delete('/sizes/{size}', [SizeController::class, 'destroy']);

    Route::get('/sugar-levels', [SugarLevelController::class, 'index']);
    Route::get('/sugar-levels/{sugarLevel}', [SugarLevelController::class, 'show']);
    Route::post('/sugar-levels', [SugarLevelController::class, 'store']);
    Route::put('/sugar-levels/{sugarLevel}', [SugarLevelController::class, 'update']);
    Route::delete('/sugar-levels/{sugarLevel}', [SugarLevelController::class, 'destroy']);

    Route::get('/ice-levels', [IceLevelController::class, 'index']);
    Route::get('/ice-levels/{iceLevel}', [IceLevelController::class, 'show']);
    Route::post('/ice-levels', [IceLevelController::class, 'store']);
    Route::put('/ice-levels/{iceLevel}', [IceLevelController::class, 'update']);
    Route::delete('/ice-levels/{iceLevel}', [IceLevelController::class, 'destroy']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::get('/addons', [AddonController::class, 'index']);
    Route::get('/addons/{addon}', [AddonController::class, 'show']);
    Route::post('/addons', [AddonController::class, 'store']);
    Route::put('/addons/{addon}', [AddonController::class, 'update']);
    Route::delete('/addons/{addon}', [AddonController::class, 'destroy']);

    Route::get('/addon-ingredients', [AddonIngredientController::class, 'index']);
    Route::post('/addon-ingredients', [AddonIngredientController::class, 'store']);
    Route::put('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'update']);
    Route::delete('/addon-ingredients/{addonIngredient}', [AddonIngredientController::class, 'destroy']);

    // Staff product management
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Customer management (staff)
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

    // Staff order management
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    Route::post('/orders/{order}/mark-printed', [OrderController::class, 'markPrinted']);

    // Table management (staff)
    Route::get('/tables/{table}', [TableController::class, 'show']);
    Route::post('/tables', [TableController::class, 'store']);
    Route::put('/tables/{table}', [TableController::class, 'update']);
    Route::delete('/tables/{table}', [TableController::class, 'destroy']);

    // Hero Slider management (staff)
    Route::get('/hero-sliders/{heroSlider}', [HeroSliderController::class, 'show']);
    Route::post('/hero-sliders', [HeroSliderController::class, 'store']);
    Route::put('/hero-sliders/{heroSlider}', [HeroSliderController::class, 'update']);
    Route::delete('/hero-sliders/{heroSlider}', [HeroSliderController::class, 'destroy']);

    // Promotion management (staff)
    Route::get('/promotions', [PromotionController::class, 'index']);
    Route::post('/promotions', [PromotionController::class, 'store']);
    Route::get('/promotions/{promotion}', [PromotionController::class, 'show']);
    Route::put('/promotions/{promotion}', [PromotionController::class, 'update']);
    Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy']);

    // Ingredient & recipe management (staff)
    Route::get('/ingredients', [IngredientController::class, 'index']);
    Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show']);
    Route::post('/ingredients', [IngredientController::class, 'store']);
    Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update']);
    Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy']);

    Route::get('/recipes', [RecipeController::class, 'index']);
    Route::get('/recipes/{recipe}', [RecipeController::class, 'show']);
    Route::post('/recipes/batch-update', [RecipeController::class, 'batchUpdate']);
    Route::post('/recipes', [RecipeController::class, 'store']);
    Route::put('/recipes/{recipe}', [RecipeController::class, 'update']);
    Route::delete('/recipes/{recipe}', [RecipeController::class, 'destroy']);

    Route::get('/inventory-transactions', [InventoryTransactionController::class, 'index']);
    Route::get('/inventory-transactions/{inventoryTransaction}', [InventoryTransactionController::class, 'show']);
    Route::post('/inventory-transactions', [InventoryTransactionController::class, 'store']);
    Route::delete('/inventory-transactions/{inventoryTransaction}', [InventoryTransactionController::class, 'destroy']);

    Route::prefix('reports')->group(function () {
        Route::get('/sales', [ReportController::class, 'sales']);
        Route::get('/products', [ReportController::class, 'products']);
        Route::get('/inventory', [ReportController::class, 'inventory']);
        Route::get('/purchases', [ReportController::class, 'purchases']);
        Route::get('/profit', [ReportController::class, 'profit']);
        Route::get('/customers', [ReportController::class, 'customers']);
        Route::get('/payments', [ReportController::class, 'payments']);
    });
});
