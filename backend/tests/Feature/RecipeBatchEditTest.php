<?php

use App\Models\Ingredient;
use App\Models\Permission;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Role;
use App\Models\Size;
use App\Models\User;

beforeEach(function () {
    $editRecipe = Permission::firstOrCreate(['slug' => 'edit-recipe'], ['name' => 'Edit Recipe']);
    $createRecipe = Permission::firstOrCreate(['slug' => 'create-recipe'], ['name' => 'Create Recipe']);
    $role = Role::create(['name' => 'Admin', 'slug' => 'admin']);
    $role->permissions()->sync([$editRecipe->id, $createRecipe->id]);
    $this->actingAs(User::factory()->create(['role_id' => $role->id]));
    $this->product = Product::factory()->create();
    $this->size = Size::factory()->create();
    $this->ing1 = Ingredient::factory()->create(['name' => 'Coffee', 'unit' => 'g']);
    $this->ing2 = Ingredient::factory()->create(['name' => 'Milk', 'unit' => 'ml']);
    $this->ing3 = Ingredient::factory()->create(['name' => 'Sugar', 'unit' => 'g']);
});

it('loads batch edit page', function () {
    Recipe::factory()->create([
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $this->ing1->id,
        'quantity' => 18,
    ]);

    $response = $this->get(route('recipes.batch-edit', [
        'product' => $this->product->id,
        'size' => $this->size->id,
    ]));

    $response->assertOk();
    $response->assertSee($this->product->name);
    $response->assertSee($this->size->name);
    $response->assertSee($this->ing1->name);
});

it('batch updates recipe quantities', function () {
    Recipe::factory()->create([
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $this->ing1->id,
        'quantity' => 18,
    ]);
    Recipe::factory()->create([
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $this->ing2->id,
        'quantity' => 200,
    ]);

    $response = $this->put(route('recipes.batch-update'), [
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'recipes' => [
            ['ingredient_id' => $this->ing1->id, 'quantity' => 20],
            ['ingredient_id' => $this->ing2->id, 'quantity' => 250],
        ],
    ]);

    $response->assertSessionHas('success');
    $response->assertRedirect(route('recipes.index'));

    $recipes = Recipe::where('product_id', $this->product->id)
        ->where('size_id', $this->size->id)->get();
    expect($recipes)->toHaveCount(2);
    expect((float) $recipes->firstWhere('ingredient_id', $this->ing1->id)->quantity)->toEqual(20.0);
    expect((float) $recipes->firstWhere('ingredient_id', $this->ing2->id)->quantity)->toEqual(250.0);
});

it('batch update replaces all recipes (removes old, adds new)', function () {
    Recipe::factory()->create([
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'ingredient_id' => $this->ing1->id,
        'quantity' => 18,
    ]);

    $response = $this->put(route('recipes.batch-update'), [
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'recipes' => [
            ['ingredient_id' => $this->ing2->id, 'quantity' => 150],
            ['ingredient_id' => $this->ing3->id, 'quantity' => 10],
        ],
    ]);

    $recipes = Recipe::where('product_id', $this->product->id)
        ->where('size_id', $this->size->id)->get();
    expect($recipes)->toHaveCount(2);
    expect($recipes->pluck('ingredient_id')->sort()->values()->toArray())
        ->toEqual([$this->ing2->id, $this->ing3->id]);
});

it('creates multiple ingredients at once via store', function () {
    $this->post(route('recipes.store'), [
        'product_id' => $this->product->id,
        'size_id' => $this->size->id,
        'recipes' => [
            ['ingredient_id' => $this->ing1->id, 'quantity' => 18],
            ['ingredient_id' => $this->ing2->id, 'quantity' => 200],
            ['ingredient_id' => $this->ing3->id, 'quantity' => 10],
        ],
    ]);

    $recipes = Recipe::where('product_id', $this->product->id)
        ->where('size_id', $this->size->id)->get();
    expect($recipes)->toHaveCount(3);
    expect((float) $recipes->firstWhere('ingredient_id', $this->ing1->id)->quantity)->toEqual(18.0);
    expect((float) $recipes->firstWhere('ingredient_id', $this->ing2->id)->quantity)->toEqual(200.0);
    expect((float) $recipes->firstWhere('ingredient_id', $this->ing3->id)->quantity)->toEqual(10.0);
});
