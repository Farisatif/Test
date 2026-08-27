<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreApiController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }

    public function dashboard(): JsonResponse
    {
        $orders = Order::query();

        return response()->json([
            'totalProducts' => Product::query()->count(),
            'totalOrders' => (clone $orders)->count(),
            'totalRevenue' => (float) (clone $orders)->sum('total'),
            'conversionRate' => 4.8,
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customerName' => ['required', 'string', 'min:1', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'min:1'],
            'city' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
        ]);

        $order = DB::transaction(function () use ($validated): Order {
            $order = Order::query()->create([
                'public_id' => 'BZ-' . Str::upper(Str::random(5)),
                'status' => 'Processing',
                'customer_name' => $validated['customerName'],
                'email' => $validated['email'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'phone' => $validated['phone'] ?? null,
                'total' => $validated['total'],
            ]);

            $order->items()->createMany(array_map(
                fn (array $item): array => [
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ],
                $validated['items'],
            ));

            return $order;
        });

        return response()->json($order->fresh()->toStoreArray(), 201);
    }
}
