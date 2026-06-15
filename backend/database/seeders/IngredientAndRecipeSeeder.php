<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Size;
use Illuminate\Database\Seeder;

class IngredientAndRecipeSeeder extends Seeder
{
    public function run(): void
    {
        $ingredients = $this->createIngredients();

        $sizes = Size::all()->keyBy('name');
        $products = Product::with('sizes', 'category')->get();

        $recipeData = [
            'Americano' => [
                'Small' => ['Espresso Shot' => 1, 'Water' => 150],
                'Medium' => ['Espresso Shot' => 2, 'Water' => 200],
                'Large' => ['Espresso Shot' => 2, 'Water' => 300],
            ],
            'Latte' => [
                'Small' => ['Espresso Shot' => 1, 'Fresh Milk' => 200],
                'Medium' => ['Espresso Shot' => 2, 'Fresh Milk' => 300],
                'Large' => ['Espresso Shot' => 2, 'Fresh Milk' => 400],
            ],
            'Cappuccino' => [
                'Small' => ['Espresso Shot' => 1, 'Fresh Milk' => 150, 'Milk Foam' => 50],
                'Medium' => ['Espresso Shot' => 2, 'Fresh Milk' => 200, 'Milk Foam' => 80],
                'Large' => ['Espresso Shot' => 2, 'Fresh Milk' => 250, 'Milk Foam' => 100],
            ],
            'Mocha' => [
                'Small' => ['Espresso Shot' => 1, 'Fresh Milk' => 180, 'Chocolate Syrup' => 20],
                'Medium' => ['Espresso Shot' => 2, 'Fresh Milk' => 250, 'Chocolate Syrup' => 30],
                'Large' => ['Espresso Shot' => 2, 'Fresh Milk' => 350, 'Chocolate Syrup' => 40],
            ],
            'Espresso' => [
                'Small' => ['Espresso Shot' => 1],
                'Medium' => ['Espresso Shot' => 2],
            ],
            'Green Tea' => [
                'Small' => ['Green Tea Leaves' => 5, 'Hot Water' => 200, 'Sugar' => 10],
                'Medium' => ['Green Tea Leaves' => 8, 'Hot Water' => 300, 'Sugar' => 15],
                'Large' => ['Green Tea Leaves' => 10, 'Hot Water' => 400, 'Sugar' => 20],
            ],
            'Thai Tea' => [
                'Small' => ['Thai Tea Mix' => 15, 'Condensed Milk' => 30, 'Evaporated Milk' => 30, 'Ice Cubes' => 100],
                'Medium' => ['Thai Tea Mix' => 20, 'Condensed Milk' => 40, 'Evaporated Milk' => 40, 'Ice Cubes' => 150],
                'Large' => ['Thai Tea Mix' => 25, 'Condensed Milk' => 50, 'Evaporated Milk' => 50, 'Ice Cubes' => 200],
            ],
            'Matcha Latte' => [
                'Medium' => ['Matcha Powder' => 10, 'Fresh Milk' => 250, 'Vanilla Syrup' => 10],
                'Large' => ['Matcha Powder' => 15, 'Fresh Milk' => 350, 'Vanilla Syrup' => 15],
            ],
            'Orange Juice' => [
                'Medium' => ['Orange' => 400],
                'Large' => ['Orange' => 600],
            ],
            'Watermelon Juice' => [
                'Medium' => ['Watermelon' => 400],
                'Large' => ['Watermelon' => 600],
            ],
            'Berry Smoothie' => [
                'Medium' => ['Strawberry' => 50, 'Blueberry' => 30, 'Raspberry' => 30, 'Yogurt' => 100, 'Honey' => 15, 'Ice Cubes' => 50],
                'Large' => ['Strawberry' => 80, 'Blueberry' => 50, 'Raspberry' => 50, 'Yogurt' => 150, 'Honey' => 20, 'Ice Cubes' => 80],
            ],
            'Mango Smoothie' => [
                'Medium' => ['Mango' => 200, 'Yogurt' => 100, 'Honey' => 15, 'Ice Cubes' => 50],
                'Large' => ['Mango' => 300, 'Yogurt' => 150, 'Honey' => 20, 'Ice Cubes' => 80],
            ],
            'Croissant' => [
                'Medium' => ['All-Purpose Flour' => 200, 'Butter' => 100, 'Fresh Milk' => 60, 'Sugar' => 20, 'Egg' => 1, 'Yeast' => 5, 'Salt' => 3],
            ],
            'Cheesecake' => [
                'Medium' => ['Cream Cheese' => 250, 'Sugar' => 80, 'Egg' => 2, 'Graham Cracker' => 100, 'Butter' => 50, 'Vanilla Extract' => 5, 'Heavy Cream' => 60],
            ],
        ];

        foreach ($products as $product) {
            $productSizes = $product->sizes;

            if (! isset($recipeData[$product->name])) {
                continue;
            }

            foreach ($recipeData[$product->name] as $sizeName => $ingredientsList) {
                $size = $sizes->get($sizeName);

                if (! $size || ! $productSizes->contains('id', $size->id)) {
                    continue;
                }

                foreach ($ingredientsList as $ingredientName => $quantity) {
                    $ingredient = $ingredients[$ingredientName] ?? null;

                    if (! $ingredient) {
                        continue;
                    }

                    Recipe::firstOrCreate([
                        'product_id' => $product->id,
                        'size_id' => $size->id,
                        'ingredient_id' => $ingredient->id,
                    ], [
                        'quantity' => $quantity,
                    ]);
                }
            }
        }

        $this->createAddonIngredients($ingredients);
    }

    private function createIngredients(): array
    {
        $ingredientList = [
            // Coffee & Espresso
            ['name' => 'Espresso Shot', 'unit' => 'shot', 'stock_quantity' => 500, 'reorder_level' => 50, 'cost_per_unit' => 0.35],
            ['name' => 'Coffee Beans', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.02],

            // Milk & Dairy
            ['name' => 'Fresh Milk', 'unit' => 'ml', 'stock_quantity' => 20000, 'reorder_level' => 2000, 'cost_per_unit' => 0.002],
            ['name' => 'Heavy Cream', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.005],
            ['name' => 'Whipped Cream', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.008],
            ['name' => 'Milk Foam', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Condensed Milk', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Evaporated Milk', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Butter', 'unit' => 'g', 'stock_quantity' => 10000, 'reorder_level' => 1000, 'cost_per_unit' => 0.004],
            ['name' => 'Cream Cheese', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.006],
            ['name' => 'Yogurt', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],

            // Milk Alternatives
            ['name' => 'Oat Milk', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.004],
            ['name' => 'Almond Milk', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.005],
            ['name' => 'Soy Milk', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Coconut Milk', 'unit' => 'ml', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.004],

            // Syrups & Sweeteners
            ['name' => 'Simple Syrup', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.002],
            ['name' => 'Caramel Syrup', 'unit' => 'ml', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.005],
            ['name' => 'Vanilla Syrup', 'unit' => 'ml', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.005],
            ['name' => 'Hazelnut Syrup', 'unit' => 'ml', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.005],
            ['name' => 'Chocolate Syrup', 'unit' => 'ml', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.004],
            ['name' => 'White Chocolate Syrup', 'unit' => 'ml', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.006],
            ['name' => 'Honey', 'unit' => 'ml', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.008],
            ['name' => 'Sugar', 'unit' => 'g', 'stock_quantity' => 10000, 'reorder_level' => 1000, 'cost_per_unit' => 0.001],
            ['name' => 'Brown Sugar', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.001],
            ['name' => 'Agave Nectar', 'unit' => 'ml', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.007],

            // Tea
            ['name' => 'Green Tea Leaves', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.005],
            ['name' => 'Thai Tea Mix', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.004],
            ['name' => 'Matcha Powder', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.02],
            ['name' => 'Black Tea Bags', 'unit' => 'pcs', 'stock_quantity' => 500, 'reorder_level' => 50, 'cost_per_unit' => 0.10],
            ['name' => 'Jasmine Tea Leaves', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.006],
            ['name' => 'Chamomile Tea Bags', 'unit' => 'pcs', 'stock_quantity' => 300, 'reorder_level' => 30, 'cost_per_unit' => 0.12],
            ['name' => 'Earl Grey Tea Bags', 'unit' => 'pcs', 'stock_quantity' => 300, 'reorder_level' => 30, 'cost_per_unit' => 0.12],
            ['name' => 'Chai Tea Concentrate', 'unit' => 'ml', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.003],

            // Fruits
            ['name' => 'Orange', 'unit' => 'g', 'stock_quantity' => 10000, 'reorder_level' => 1000, 'cost_per_unit' => 0.002],
            ['name' => 'Watermelon', 'unit' => 'g', 'stock_quantity' => 15000, 'reorder_level' => 1500, 'cost_per_unit' => 0.001],
            ['name' => 'Strawberry', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.005],
            ['name' => 'Blueberry', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.008],
            ['name' => 'Raspberry', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.009],
            ['name' => 'Mango', 'unit' => 'g', 'stock_quantity' => 8000, 'reorder_level' => 800, 'cost_per_unit' => 0.003],
            ['name' => 'Lemon', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.002],
            ['name' => 'Lime', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.002],
            ['name' => 'Passion Fruit', 'unit' => 'pcs', 'stock_quantity' => 300, 'reorder_level' => 30, 'cost_per_unit' => 0.25],
            ['name' => 'Pineapple', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Banana', 'unit' => 'pcs', 'stock_quantity' => 200, 'reorder_level' => 20, 'cost_per_unit' => 0.15],
            ['name' => 'Avocado', 'unit' => 'pcs', 'stock_quantity' => 100, 'reorder_level' => 10, 'cost_per_unit' => 0.50],

            // Powders & Mixes
            ['name' => 'Cocoa Powder', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.008],
            ['name' => 'Cinnamon Powder', 'unit' => 'g', 'stock_quantity' => 1000, 'reorder_level' => 100, 'cost_per_unit' => 0.01],
            ['name' => 'Nutmeg Powder', 'unit' => 'g', 'stock_quantity' => 500, 'reorder_level' => 50, 'cost_per_unit' => 0.015],
            ['name' => 'Vanilla Extract', 'unit' => 'ml', 'stock_quantity' => 1000, 'reorder_level' => 100, 'cost_per_unit' => 0.02],
            ['name' => 'Protein Powder', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.01],

            // Toppings & Add-ins
            ['name' => 'Boba Pearls', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Tapioca Pearls', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
            ['name' => 'Coffee Jelly', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.005],
            ['name' => 'Grass Jelly', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.004],
            ['name' => 'Coconut Jelly', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.005],
            ['name' => 'Aloe Vera', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.006],
            ['name' => 'Nata De Coco', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.003],
            ['name' => 'Popping Boba', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.007],
            ['name' => 'Crushed Oreo', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.006],
            ['name' => 'Chocolate Chips', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.007],

            // Pastry & Baking
            ['name' => 'All-Purpose Flour', 'unit' => 'g', 'stock_quantity' => 20000, 'reorder_level' => 2000, 'cost_per_unit' => 0.001],
            ['name' => 'Bread Flour', 'unit' => 'g', 'stock_quantity' => 10000, 'reorder_level' => 1000, 'cost_per_unit' => 0.001],
            ['name' => 'Pastry Flour', 'unit' => 'g', 'stock_quantity' => 10000, 'reorder_level' => 1000, 'cost_per_unit' => 0.001],
            ['name' => 'Egg', 'unit' => 'pcs', 'stock_quantity' => 500, 'reorder_level' => 50, 'cost_per_unit' => 0.12],
            ['name' => 'Yeast', 'unit' => 'g', 'stock_quantity' => 1000, 'reorder_level' => 100, 'cost_per_unit' => 0.005],
            ['name' => 'Salt', 'unit' => 'g', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.001],
            ['name' => 'Baking Powder', 'unit' => 'g', 'stock_quantity' => 2000, 'reorder_level' => 200, 'cost_per_unit' => 0.002],
            ['name' => 'Baking Soda', 'unit' => 'g', 'stock_quantity' => 1000, 'reorder_level' => 100, 'cost_per_unit' => 0.002],
            ['name' => 'Graham Cracker', 'unit' => 'g', 'stock_quantity' => 3000, 'reorder_level' => 300, 'cost_per_unit' => 0.004],

            // Water & Ice
            ['name' => 'Water', 'unit' => 'ml', 'stock_quantity' => 100000, 'reorder_level' => 10000, 'cost_per_unit' => 0.0001],
            ['name' => 'Hot Water', 'unit' => 'ml', 'stock_quantity' => 100000, 'reorder_level' => 10000, 'cost_per_unit' => 0.0001],
            ['name' => 'Ice Cubes', 'unit' => 'g', 'stock_quantity' => 50000, 'reorder_level' => 5000, 'cost_per_unit' => 0.0005],
            ['name' => 'Sparkling Water', 'unit' => 'ml', 'stock_quantity' => 10000, 'reorder_level' => 1000, 'cost_per_unit' => 0.002],
            ['name' => 'Coconut Water', 'unit' => 'ml', 'stock_quantity' => 5000, 'reorder_level' => 500, 'cost_per_unit' => 0.003],
        ];

        $ingredients = [];

        foreach ($ingredientList as $data) {
            $ingredients[$data['name']] = Ingredient::firstOrCreate(
                ['name' => $data['name']],
                $data
            );
        }

        return $ingredients;
    }

    private function createAddonIngredients(array $ingredients): void
    {
        $addons = Addon::all()->keyBy('name');

        $addonIngredientData = [
            'Boba' => ['Boba Pearls' => 50],
            'Jelly' => ['Coconut Jelly' => 50],
            'Coffee Jelly' => ['Coffee Jelly' => 50],
            'Tapioca' => ['Tapioca Pearls' => 50],
            'Whipped Cream' => ['Whipped Cream' => 30],
        ];

        foreach ($addonIngredientData as $addonName => $ingredientsList) {
            $addon = $addons->get($addonName);

            if (! $addon) {
                continue;
            }

            foreach ($ingredientsList as $ingredientName => $quantity) {
                $ingredient = $ingredients[$ingredientName] ?? null;

                if (! $ingredient) {
                    continue;
                }

                $addon->addonIngredients()->firstOrCreate(
                    ['ingredient_id' => $ingredient->id],
                    ['quantity' => $quantity],
                );
            }
        }
    }
}
