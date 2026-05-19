<?php

namespace Database\Factories;

use App\Models\SugarLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

class SugarLevelFactory extends Factory
{
    protected $model = SugarLevel::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['No Sugar', 'Less Sugar', 'Normal Sugar', 'Extra Sugar']),
        ];
    }
}
