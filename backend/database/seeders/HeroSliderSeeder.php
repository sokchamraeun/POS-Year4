<?php

namespace Database\Seeders;

use App\Models\HeroSlider;
use Illuminate\Database\Seeder;

class HeroSliderSeeder extends Seeder
{
    public function run(): void
    {
        $sliders = [
            [
                'title' => 'Welcome to',
                'highlight' => 'Visal Coffee',
                'text' => 'Your all-in-one point of sale solution. Browse our coffee menu, customize your drink, and order with ease.',
                'image' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&h=800&fit=crop',
                'badge' => 'Since 2024',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Freshly Brewed',
                'highlight' => 'Premium Coffee',
                'text' => 'Enjoy premium coffee beans sourced from the finest farms around the world. Each cup is crafted with passion.',
                'image' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=800&fit=crop',
                'badge' => 'Artisan Roast',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Special',
                'highlight' => 'Daily Offers',
                'text' => "Get up to 20% off on selected beverages. Don't miss out on our daily deals and seasonal specials!",
                'image' => 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1920&h=800&fit=crop',
                'badge' => 'Limited Time',
                'order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($sliders as $slider) {
            HeroSlider::create($slider);
        }
    }
}
