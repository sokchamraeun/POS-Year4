<?php

namespace Database\Factories;

use App\Models\Addon;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddonFactory extends Factory
{
    protected $model = Addon::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'price' => fake()->randomFloat(2, 0.5, 5),
        ];
    }
}
