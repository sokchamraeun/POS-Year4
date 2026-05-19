<?php

namespace Database\Factories;

use App\Models\Addon;
use App\Models\AddonIngredient;
use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddonIngredientFactory extends Factory
{
    protected $model = AddonIngredient::class;

    public function definition(): array
    {
        return [
            'addon_id' => Addon::factory(),
            'ingredient_id' => Ingredient::factory(),
            'quantity' => fake()->randomFloat(2, 1, 50),
        ];
    }
}
