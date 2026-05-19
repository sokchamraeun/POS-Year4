<?php

namespace Database\Factories;

use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Factories\Factory;

class IngredientFactory extends Factory
{
    protected $model = Ingredient::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'unit' => fake()->randomElement(['g', 'ml', 'pcs']),
            'stock_quantity' => 1000,
            'reorder_level' => 100,
        ];
    }
}
