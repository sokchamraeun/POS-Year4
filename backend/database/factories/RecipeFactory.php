<?php

namespace Database\Factories;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Size;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecipeFactory extends Factory
{
    protected $model = Recipe::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'size_id' => Size::factory(),
            'ingredient_id' => Ingredient::factory(),
            'quantity' => fake()->randomFloat(2, 1, 50),
        ];
    }
}
