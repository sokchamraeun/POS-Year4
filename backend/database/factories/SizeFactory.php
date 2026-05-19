<?php

namespace Database\Factories;

use App\Models\Size;
use Illuminate\Database\Eloquent\Factories\Factory;

class SizeFactory extends Factory
{
    protected $model = Size::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement(['Small', 'Medium', 'Large']),
        ];
    }
}
