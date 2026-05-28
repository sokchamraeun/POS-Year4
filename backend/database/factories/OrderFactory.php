<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'table_id' => null,
            'total' => fake()->randomFloat(2, 5, 100),
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'status' => 'completed',
        ];
    }

    public function withoutCustomer(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_id' => null,
        ]);
    }
}
