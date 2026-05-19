<?php

namespace Database\Factories;

use App\Models\IceLevel;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Size;
use App\Models\SugarLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'size_id' => Size::factory(),
            'sugar_level_id' => SugarLevel::factory(),
            'ice_level_id' => IceLevel::factory(),
            'qty' => 1,
            'unit_price' => fake()->randomFloat(2, 2, 10),
            'subtotal' => fake()->randomFloat(2, 2, 10),
        ];
    }
}
