<?php

use App\Models\Addon;
use App\Models\AddonIngredient;
use App\Models\Customer;
use App\Models\IceLevel;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Size;
use App\Models\SugarLevel;

beforeEach(function () {
    $this->customer = Customer::factory()->create();
    $this->size = Size::factory()->create();
    $this->sugarLevel = SugarLevel::factory()->create();
    $this->iceLevel = IceLevel::factory()->create();
    $this->addon = Addon::factory()->create();
});

it('deducts ingredients when an order is placed', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 29.99,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'status' => 'completed',
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 2,
                'unit_price' => 15.00,
                'subtotal' => 30.00,
            ],
        ],
    ]);

    $response->assertStatus(201);
    $ingredient->refresh();
    expect((float) $ingredient->stock_quantity)->toEqual(80.0);
});

it('deducts correct quantity = recipe_qty * order_qty', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 500]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 25.5,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 20.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 3,
                'unit_price' => 10.00,
                'subtotal' => 30.00,
            ],
        ],
    ]);

    $ingredient->refresh();
    expect((float) $ingredient->stock_quantity)->toEqual(500.0 - (25.5 * 3));
});

it('deducts multiple ingredients for a product with multiple recipe entries', function () {
    $product = Product::factory()->create();
    $coffee = Ingredient::factory()->create(['name' => 'Coffee Beans', 'unit' => 'g', 'stock_quantity' => 1000]);
    $water = Ingredient::factory()->create(['name' => 'Water', 'unit' => 'ml', 'stock_quantity' => 5000]);
    Recipe::factory()->create(['product_id' => $product->id, 'size_id' => $this->size->id, 'ingredient_id' => $coffee->id, 'quantity' => 18]);
    Recipe::factory()->create(['product_id' => $product->id, 'size_id' => $this->size->id, 'ingredient_id' => $water->id, 'quantity' => 200]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 15.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 2,
                'unit_price' => 7.50,
                'subtotal' => 15.00,
            ],
        ],
    ]);

    $coffee->refresh();
    $water->refresh();
    expect((float) $coffee->stock_quantity)->toEqual(1000.0 - 36.0);
    expect((float) $water->stock_quantity)->toEqual(5000.0 - 400.0);
});

it('returns 422 when ingredient stock is insufficient', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 10]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 20,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 10.00,
                'subtotal' => 10.00,
            ],
        ],
    ]);

    $response->assertStatus(422);
    $response->assertJson(['message' => 'Insufficient ingredient stock']);
});

it('does not deduct stock when order fails validation', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => 99999,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 10.00,
                'subtotal' => 10.00,
            ],
        ],
    ]);

    $response->assertStatus(422);
    $ingredient->refresh();
    expect((float) $ingredient->stock_quantity)->toEqual(100.0);
});

it('does not change stock when ingredient stock is insufficient', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 5]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 10.00,
                'subtotal' => 10.00,
            ],
        ],
    ]);

    $ingredient->refresh();
    expect((float) $ingredient->stock_quantity)->toEqual(5.0);
});

it('creates inventory_transactions for each deduction', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 15.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 15.00,
                'subtotal' => 15.00,
            ],
        ],
    ]);

    $order = Order::first();
    $transactions = InventoryTransaction::all();
    expect($transactions)->toHaveCount(1);
    expect($transactions[0]->type)->toEqual('deduct');
    expect((float) $transactions[0]->quantity)->toEqual(-10.0);
    expect($transactions[0]->ingredient_id)->toEqual($ingredient->id);
    expect($transactions[0]->note)->toContain("Order #{$order->id}");
});

it('deducts ingredients for multiple items in a single order', function () {
    $product1 = Product::factory()->create();
    $product2 = Product::factory()->create();
    $coffee = Ingredient::factory()->create(['stock_quantity' => 1000]);
    $milk = Ingredient::factory()->create(['stock_quantity' => 2000]);
    Recipe::factory()->create(['product_id' => $product1->id, 'size_id' => $this->size->id, 'ingredient_id' => $coffee->id, 'quantity' => 18]);
    Recipe::factory()->create(['product_id' => $product2->id, 'size_id' => $this->size->id, 'ingredient_id' => $milk->id, 'quantity' => 150]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 30.00,
        'items' => [
            [
                'product_id' => $product1->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 2,
                'unit_price' => 7.50,
                'subtotal' => 15.00,
            ],
            [
                'product_id' => $product2->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 15.00,
                'subtotal' => 15.00,
            ],
        ],
    ]);

    $coffee->refresh();
    $milk->refresh();
    expect((float) $coffee->stock_quantity)->toEqual(1000.0 - 36.0);
    expect((float) $milk->stock_quantity)->toEqual(2000.0 - 150.0);
});

it('creates order successfully when product has no recipe', function () {
    $product = Product::factory()->create();

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 10.00,
                'subtotal' => 10.00,
            ],
        ],
    ]);

    $response->assertStatus(201);
});

it('deducts ingredients with addons included in order', function () {
    $product = Product::factory()->create();
    $productIngredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    $addonIngredient = Ingredient::factory()->create(['stock_quantity' => 200]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $productIngredient->id,
        'quantity' => 10,
    ]);
    AddonIngredient::factory()->create([
        'addon_id' => $this->addon->id,
        'ingredient_id' => $addonIngredient->id,
        'quantity' => 15,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 25.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 2,
                'unit_price' => 10.00,
                'subtotal' => 20.00,
                'addons' => [
                    ['addon_id' => $this->addon->id, 'price' => 5.00],
                ],
            ],
        ],
    ]);

    $response->assertStatus(201);
    $productIngredient->refresh();
    $addonIngredient->refresh();
    expect((float) $productIngredient->stock_quantity)->toEqual(80.0);
    expect((float) $addonIngredient->stock_quantity)->toEqual(170.0);
});

it('deducts addon ingredients even when product has no recipe', function () {
    $product = Product::factory()->create();
    $addonIngredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    AddonIngredient::factory()->create([
        'addon_id' => $this->addon->id,
        'ingredient_id' => $addonIngredient->id,
        'quantity' => 20,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 15.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 15.00,
                'subtotal' => 15.00,
                'addons' => [
                    ['addon_id' => $this->addon->id, 'price' => 2.00],
                ],
            ],
        ],
    ]);

    $response->assertStatus(201);
    $addonIngredient->refresh();
    expect((float) $addonIngredient->stock_quantity)->toEqual(80.0);
});

it('returns 422 when addon ingredient stock is insufficient', function () {
    $product = Product::factory()->create();
    $addonIngredient = Ingredient::factory()->create(['stock_quantity' => 5]);
    AddonIngredient::factory()->create([
        'addon_id' => $this->addon->id,
        'ingredient_id' => $addonIngredient->id,
        'quantity' => 20,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 15.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 15.00,
                'subtotal' => 15.00,
                'addons' => [
                    ['addon_id' => $this->addon->id, 'price' => 2.00],
                ],
            ],
        ],
    ]);

    $response->assertStatus(422);
    $response->assertJson(['message' => 'Insufficient ingredient stock']);
});

it('deducts both product recipe and addon ingredients together', function () {
    $product = Product::factory()->create();
    $productIng = Ingredient::factory()->create(['stock_quantity' => 500]);
    $addonIng = Ingredient::factory()->create(['stock_quantity' => 300]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $productIng->id,
        'quantity' => 50,
    ]);
    AddonIngredient::factory()->create([
        'addon_id' => $this->addon->id,
        'ingredient_id' => $addonIng->id,
        'quantity' => 25,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 20.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 3,
                'unit_price' => 10.00,
                'subtotal' => 30.00,
                'addons' => [
                    ['addon_id' => $this->addon->id, 'price' => 2.00],
                ],
            ],
        ],
    ]);

    $productIng->refresh();
    $addonIng->refresh();
    expect((float) $productIng->stock_quantity)->toEqual(500.0 - 150.0);
    expect((float) $addonIng->stock_quantity)->toEqual(300.0 - 75.0);
});

it('deducts multiple addon ingredients for a single addon', function () {
    $product = Product::factory()->create();
    $ing1 = Ingredient::factory()->create(['stock_quantity' => 200]);
    $ing2 = Ingredient::factory()->create(['stock_quantity' => 200]);
    AddonIngredient::factory()->create([
        'addon_id' => $this->addon->id,
        'ingredient_id' => $ing1->id,
        'quantity' => 10,
    ]);
    AddonIngredient::factory()->create([
        'addon_id' => $this->addon->id,
        'ingredient_id' => $ing2->id,
        'quantity' => 20,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 15.00,
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 2,
                'unit_price' => 15.00,
                'subtotal' => 30.00,
                'addons' => [
                    ['addon_id' => $this->addon->id, 'price' => 2.00],
                ],
            ],
        ],
    ]);

    $ing1->refresh();
    $ing2->refresh();
    expect((float) $ing1->stock_quantity)->toEqual(200.0 - 20.0);
    expect((float) $ing2->stock_quantity)->toEqual(200.0 - 40.0);
});

it('deducts for multiple orders cumulatively', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'items' => [
            ['product_id' => $product->id, 'size_id' => $this->size->id, 'sugar_level_id' => $this->sugarLevel->id, 'ice_level_id' => $this->iceLevel->id, 'qty' => 1, 'unit_price' => 10.00, 'subtotal' => 10.00],
        ],
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'items' => [
            ['product_id' => $product->id, 'size_id' => $this->size->id, 'sugar_level_id' => $this->sugarLevel->id, 'ice_level_id' => $this->iceLevel->id, 'qty' => 2, 'unit_price' => 10.00, 'subtotal' => 20.00],
        ],
    ]);

    $ingredient->refresh();
    expect((float) $ingredient->stock_quantity)->toEqual(70.0);
});

it('uses size-specific recipe when available', function () {
    $product = Product::factory()->create();
    $sizeSmall = Size::factory()->create(['name' => 'Small']);
    $sizeLarge = Size::factory()->create(['name' => 'Large']);
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 500]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $sizeSmall->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $sizeLarge->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 30,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 20.00,
        'items' => [[
            'product_id' => $product->id,
            'size_id' => $sizeSmall->id,
            'sugar_level_id' => $this->sugarLevel->id,
            'ice_level_id' => $this->iceLevel->id,
            'qty' => 2,
            'unit_price' => 10.00,
            'subtotal' => 20.00,
        ]],
    ]);

    $ingredient->refresh();
    expect((float) $ingredient->stock_quantity)->toEqual(500.0 - 20.0);
});

it('returns the created order with all relationships', function () {
    $product = Product::factory()->create();
    $ingredient = Ingredient::factory()->create(['stock_quantity' => 100]);
    Recipe::factory()->create([
        'product_id' => $product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $ingredient->id,
        'quantity' => 10,
    ]);

    $response = $this->postJson('/api/orders', [
        'customer_id' => $this->customer->id,
        'total' => 10.00,
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'status' => 'completed',
        'items' => [
            [
                'product_id' => $product->id,
                'size_id' => $this->size->id,
                'sugar_level_id' => $this->sugarLevel->id,
                'ice_level_id' => $this->iceLevel->id,
                'qty' => 1,
                'unit_price' => 10.00,
                'subtotal' => 10.00,
            ],
        ],
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'id', 'customer_id', 'table_id', 'total', 'payment_method', 'payment_status', 'status',
        'items' => [
            '*' => ['id', 'product_id', 'size_id', 'qty', 'unit_price', 'subtotal'],
        ],
    ]);
});
