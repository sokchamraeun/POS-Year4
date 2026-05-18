<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon'])
            ->orderByDesc('id')->paginate(10);
        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        return response()->json($order);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'table_id' => 'nullable|exists:tables,id',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.size_id' => 'required|exists:sizes,id',
            'items.*.sugar_level_id' => 'nullable|exists:sugar_levels,id',
            'items.*.ice_level_id' => 'nullable|exists:ice_levels,id',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
            'items.*.addons' => 'nullable|array',
            'items.*.addons.*.addon_id' => 'required|exists:addons,id',
            'items.*.addons.*.price' => 'nullable|numeric|min:0',
        ]);

        $order = Order::create([
            'customer_id' => $data['customer_id'] ?? null,
            'table_id' => $data['table_id'] ?? null,
            'total' => $data['total'],
            'payment_method' => $data['payment_method'] ?? null,
            'payment_status' => $data['payment_status'] ?? null,
            'status' => $data['status'] ?? null,
        ]);

        foreach ($data['items'] as $itemData) {
            $item = $order->items()->create([
                'product_id' => $itemData['product_id'],
                'size_id' => $itemData['size_id'],
                'sugar_level_id' => $itemData['sugar_level_id'] ?? null,
                'ice_level_id' => $itemData['ice_level_id'] ?? null,
                'qty' => $itemData['qty'] ?? 1,
                'unit_price' => $itemData['unit_price'] ?? 0,
                'subtotal' => $itemData['subtotal'] ?? 0,
            ]);

            if (!empty($itemData['addons'])) {
                foreach ($itemData['addons'] as $addonData) {
                    $item->addons()->create([
                        'addon_id' => $addonData['addon_id'],
                        'price' => $addonData['price'] ?? 0,
                    ]);
                }
            }
        }

        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        return response()->json($order, 201);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'table_id' => 'nullable|exists:tables,id',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
        ]);

        $order->update([
            'customer_id' => $data['customer_id'] ?? null,
            'table_id' => $data['table_id'] ?? null,
            'total' => $data['total'],
            'payment_method' => $data['payment_method'] ?? null,
            'payment_status' => $data['payment_status'] ?? null,
            'status' => $data['status'] ?? null,
        ]);

        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        return response()->json($order);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully.']);
    }
}
