<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Category;
use App\Models\IceLevel;
use App\Models\Product;
use App\Models\Size;
use App\Models\SugarLevel;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $sizes = collect(['Small', 'Medium', 'Large'])
            ->map(fn ($name) => Size::firstOrCreate(['name' => $name]));

        $sugarLevels = collect(['No Sugar', 'Less Sugar', 'Normal Sugar', 'Extra Sugar'])
            ->map(fn ($name) => SugarLevel::firstOrCreate(['name' => $name]));

        $iceLevels = collect(['No Ice', 'Less Ice', 'Normal Ice', 'Extra Ice'])
            ->map(fn ($name) => IceLevel::firstOrCreate(['name' => $name]));

        $addons = collect([
            ['name' => 'Boba', 'price' => 0.50],
            ['name' => 'Jelly', 'price' => 0.50],
            ['name' => 'Whipped Cream', 'price' => 0.75],
            ['name' => 'Coffee Jelly', 'price' => 1.00],
            ['name' => 'Tapioca', 'price' => 0.50],
        ])->map(fn ($data) => Addon::firstOrCreate(['name' => $data['name']], $data));

        $categoryData = [
            'Coffee' => [
                ['name' => 'Americano', 'desc' => 'Espresso with hot water', 'sizes' => ['Small' => 2.50, 'Medium' => 3.00, 'Large' => 3.50]],
                ['name' => 'Latte', 'desc' => 'Espresso with steamed milk', 'sizes' => ['Small' => 3.00, 'Medium' => 3.50, 'Large' => 4.00]],
                ['name' => 'Cappuccino', 'desc' => 'Espresso with foamed milk', 'sizes' => ['Small' => 3.00, 'Medium' => 3.50, 'Large' => 4.00]],
                ['name' => 'Mocha', 'desc' => 'Espresso with chocolate', 'sizes' => ['Small' => 3.50, 'Medium' => 4.00, 'Large' => 4.50]],
                ['name' => 'Espresso', 'desc' => 'Strong black coffee', 'sizes' => ['Small' => 2.00, 'Medium' => 2.50]],
            ],
            'Tea' => [
                ['name' => 'Green Tea', 'desc' => 'Japanese green tea', 'sizes' => ['Small' => 2.00, 'Medium' => 2.50, 'Large' => 3.00]],
                ['name' => 'Thai Tea', 'desc' => 'Sweet Thai iced tea', 'sizes' => ['Small' => 2.50, 'Medium' => 3.00, 'Large' => 3.50]],
                ['name' => 'Matcha Latte', 'desc' => 'Matcha with milk', 'sizes' => ['Medium' => 4.00, 'Large' => 4.50]],
            ],
            'Juice' => [
                ['name' => 'Orange Juice', 'desc' => 'Fresh squeezed orange', 'sizes' => ['Medium' => 3.50, 'Large' => 4.00]],
                ['name' => 'Watermelon Juice', 'desc' => 'Fresh blended watermelon', 'sizes' => ['Medium' => 3.50, 'Large' => 4.00]],
            ],
            'Smoothie' => [
                ['name' => 'Berry Smoothie', 'desc' => 'Mixed berries blended', 'sizes' => ['Medium' => 4.50, 'Large' => 5.00]],
                ['name' => 'Mango Smoothie', 'desc' => 'Fresh mango blended', 'sizes' => ['Medium' => 4.50, 'Large' => 5.00]],
            ],
            'Pastry' => [
                ['name' => 'Croissant', 'desc' => 'Butter croissant', 'sizes' => ['Medium' => 2.50]],
                ['name' => 'Cheesecake', 'desc' => 'New York style cheesecake', 'sizes' => ['Medium' => 4.00]],
            ],
        ];

        foreach ($categoryData as $categoryName => $products) {
            $category = Category::firstOrCreate(['name' => $categoryName]);

            foreach ($products as $productData) {
                $product = Product::firstOrCreate(
                    ['category_id' => $category->id, 'name' => $productData['name']],
                    ['description' => $productData['desc'], 'status' => true],
                );

                $product->sugarLevels()->syncWithoutDetaching(
                    $sugarLevels->random(rand(1, 3))->pluck('id')->toArray()
                );

                $product->iceLevels()->syncWithoutDetaching(
                    $iceLevels->random(rand(1, 3))->pluck('id')->toArray()
                );

                $sizeIds = [];
                foreach ($productData['sizes'] as $sizeName => $price) {
                    $size = $sizes->firstWhere('name', $sizeName);
                    $sizeIds[$size->id] = ['price' => $price];
                }
                $product->sizes()->syncWithoutDetaching($sizeIds);

                $product->addons()->syncWithoutDetaching(
                    $addons->random(rand(2, 4))->pluck('id')->toArray()
                );
            }
        }
    }
}
