<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Everyday Linen Shirt',
                'category' => 'Clothing',
                'price' => 42,
                'compare_at_price' => 58,
                'image' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',
                'description' => 'A breathable, easygoing linen shirt made for warm days and slow weekends. Cut with a relaxed fit and finished with natural shell buttons.',
                'rating' => 4.9,
                'reviews' => 124,
                'badge' => 'Bestseller',
                'featured' => true,
                'colors' => ['#F7F4ED', '#7EC151', '#B2054C'],
                'sizes' => ['XS', 'S', 'M', 'L', 'XL'],
            ],
            [
                'name' => 'Cloud Knit Cardigan',
                'category' => 'Clothing',
                'price' => 68,
                'compare_at_price' => null,
                'image' => 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
                'description' => 'Soft brushed knit with a little extra room for layering. Your new favorite piece for cool mornings and coffee runs.',
                'rating' => 4.8,
                'reviews' => 86,
                'badge' => 'New in',
                'featured' => true,
                'colors' => ['#D9C4AF', '#B2054C', '#007DCC'],
                'sizes' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name' => 'Sculptural Ceramic Vase',
                'category' => 'Home',
                'price' => 36,
                'compare_at_price' => 48,
                'image' => 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=85',
                'description' => 'A hand-finished ceramic vase with a playful silhouette. Designed to hold a few wild stems or stand beautifully on its own.',
                'rating' => 4.7,
                'reviews' => 52,
                'badge' => 'Limited',
                'featured' => true,
                'colors' => ['#F7F4ED', '#FFB900'],
                'sizes' => ['One size'],
            ],
            [
                'name' => 'Mini Crossbody Bag',
                'category' => 'Accessories',
                'price' => 54,
                'compare_at_price' => null,
                'image' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85',
                'description' => 'Compact, considered, and ready for everywhere. This structured crossbody keeps your essentials close without weighing you down.',
                'rating' => 4.9,
                'reviews' => 71,
                'badge' => null,
                'featured' => true,
                'colors' => ['#B2054C', '#FFB900', '#007DCC'],
                'sizes' => ['One size'],
            ],
            [
                'name' => 'Weekend Canvas Tote',
                'category' => 'Accessories',
                'price' => 29,
                'compare_at_price' => 39,
                'image' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85',
                'description' => 'A roomy cotton canvas tote that carries groceries, books, and all the little things in between.',
                'rating' => 4.6,
                'reviews' => 109,
                'badge' => 'Everyday pick',
                'featured' => false,
                'colors' => ['#F7F4ED', '#7EC151'],
                'sizes' => ['One size'],
            ],
            [
                'name' => 'Citrus Glow Candle',
                'category' => 'Beauty',
                'price' => 24,
                'compare_at_price' => null,
                'image' => 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85',
                'description' => 'Bright citrus, neroli, and a soft woody base poured into a reusable glass vessel.',
                'rating' => 4.8,
                'reviews' => 63,
                'badge' => 'New in',
                'featured' => false,
                'colors' => ['#FFB900', '#F7F4ED'],
                'sizes' => ['One size'],
            ],
            [
                'name' => 'Ribbed Lounge Set',
                'category' => 'Clothing',
                'price' => 76,
                'compare_at_price' => 92,
                'image' => 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85',
                'description' => 'A soft, ribbed two-piece set that moves from home to out-and-about without missing a beat.',
                'rating' => 4.7,
                'reviews' => 48,
                'badge' => 'Trending',
                'featured' => false,
                'colors' => ['#7EC151', '#D10056', '#F7F4ED'],
                'sizes' => ['XS', 'S', 'M', 'L'],
            ],
            [
                'name' => 'Color Block Throw',
                'category' => 'Home',
                'price' => 44,
                'compare_at_price' => null,
                'image' => 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85',
                'description' => 'A cheerful woven throw with tactile fringe, made to bring a little more color to your favorite corner.',
                'rating' => 4.9,
                'reviews' => 37,
                'badge' => 'Staff favorite',
                'featured' => false,
                'colors' => ['#007DCC', '#FFB900', '#D10056'],
                'sizes' => ['One size'],
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['name' => $product['name']],
                $product,
            );
        }
    }
}
