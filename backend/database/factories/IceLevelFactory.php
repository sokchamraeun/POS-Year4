<?php

namespace Database\Factories;

use App\Models\IceLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

class IceLevelFactory extends Factory
{
    protected $model = IceLevel::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice']),
        ];
    }
}
