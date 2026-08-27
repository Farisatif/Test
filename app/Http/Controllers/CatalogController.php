<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function products(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && strtolower((string) $request->input('category')) !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->has('featured')) {
            $query->where('featured', filter_var($request->input('featured'), FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->get()->map->toStoreArray()->values());
    }

    public function product(Product $product): JsonResponse
    {
        return response()->json($product->toStoreArray());
    }

    public function categories(): JsonResponse
    {
        $images = [
            'all' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=85',
            'Clothing' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=85',
            'Home' => 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=85',
            'Accessories' => 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=700&q=85',
            'Beauty' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=85',
        ];

        $categories = collect([['id' => 'all', 'name' => 'All products']])
            ->concat(Product::query()->select('category')->distinct()->orderBy('category')->pluck('category')->map(
                fn (string $category): array => ['id' => $category, 'name' => $category],
            ))
            ->map(function (array $category) use ($images): array {
                return [
                    ...$category,
                    'count' => $category['id'] === 'all'
                        ? Product::query()->count()
                        : Product::query()->where('category', $category['id'])->count(),
                    'image' => $images[$category['id']] ?? null,
                ];
            });

        return response()->json($categories->values());
    }
}
