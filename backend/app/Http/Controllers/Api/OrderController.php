<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AddonIngredient;
use App\Models\Customer;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\User;
use App\Services\SocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy'])
            ->orderByDesc('id')->paginate(10);
        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);
        return response()->json($order);
    }

    public function customerHistory(Request $request): JsonResponse
    {
        $data = $request->validate(['phone' => 'required|string']);
        $customer = Customer::where('phone', $data['phone'])->first();
        if (!$customer) {
            return response()->json(['data' => [], 'message' => 'No orders found']);
        }
        $orders = Order::with(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate(10);
        return response()->json($orders);
    }

    public function userHistory(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email']);
        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return response()->json(['data' => [], 'message' => 'No orders found']);
        }
        $orders = Order::with(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon'])
            ->whereHas('customer', fn($q) => $q->where('name', $user->name))
            ->orWhereHas('customer', fn($q) => $q->where('phone', $user->email))
            ->orderByDesc('id')
            ->paginate(10);
        return response()->json($orders);
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

        $insufficient = [];
        foreach ($data['items'] as $itemData) {
            $qty = $itemData['qty'] ?? 1;
            $sizeId = $itemData['size_id'] ?? null;

            $recipes = $this->getRecipes($itemData['product_id'], $sizeId);
            foreach ($recipes as $recipe) {
                if (!$recipe->ingredient) continue;
                $needed = $recipe->quantity * $qty;
                if ($recipe->ingredient->stock_quantity < $needed) {
                    $insufficient[] = sprintf(
                        '%s: need %.2f %s, have %.2f %s',
                        $recipe->ingredient->name,
                        $needed,
                        $recipe->ingredient->unit,
                        $recipe->ingredient->stock_quantity,
                        $recipe->ingredient->unit
                    );
                }
            }

            if (!empty($itemData['addons'])) {
                foreach ($itemData['addons'] as $addonData) {
                    $addonIngredients = AddonIngredient::where('addon_id', $addonData['addon_id'])
                        ->with('ingredient')->get();
                    foreach ($addonIngredients as $ai) {
                        if (!$ai->ingredient) continue;
                        $needed = $ai->quantity * $qty;
                        if ($ai->ingredient->stock_quantity < $needed) {
                            $insufficient[] = sprintf(
                                '%s: need %.2f %s, have %.2f %s',
                                $ai->ingredient->name,
                                $needed,
                                $ai->ingredient->unit,
                                $ai->ingredient->stock_quantity,
                                $ai->ingredient->unit
                            );
                        }
                    }
                }
            }
        }

        if (!empty($insufficient)) {
            return response()->json([
                'message' => 'Insufficient ingredient stock',
                'errors' => $insufficient,
            ], 422);
        }

        $order = DB::transaction(function () use ($data) {
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

                $qty = $itemData['qty'] ?? 1;
                $sizeId = $itemData['size_id'] ?? null;

                if (!empty($itemData['addons'])) {
                    foreach ($itemData['addons'] as $addonData) {
                        $item->addons()->create([
                            'addon_id' => $addonData['addon_id'],
                            'price' => $addonData['price'] ?? 0,
                        ]);

                        $addonIngredients = AddonIngredient::where('addon_id', $addonData['addon_id'])->get();
                        foreach ($addonIngredients as $ai) {
                            if (!$ai->ingredient) continue;
                            $deductQty = $ai->quantity * $qty;
                            $ai->ingredient->decrement('stock_quantity', $deductQty);
                            InventoryTransaction::create([
                                'ingredient_id' => $ai->ingredient_id,
                                'type' => 'deduct',
                                'quantity' => -$deductQty,
                                'note' => "Auto-deducted for Order #{$order->id}",
                            ]);
                        }
                    }
                }

                $recipes = $this->getRecipes($itemData['product_id'], $sizeId);
                foreach ($recipes as $recipe) {
                    if (!$recipe->ingredient) continue;
                    $deductQty = $recipe->quantity * $qty;
                    $recipe->ingredient->decrement('stock_quantity', $deductQty);
                    InventoryTransaction::create([
                        'ingredient_id' => $recipe->ingredient_id,
                        'type' => 'deduct',
                        'quantity' => -$deductQty,
                        'note' => "Auto-deducted for Order #{$order->id}",
                    ]);
                }
            }

            return $order;
        });

        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);
        app(SocketService::class)->orderCreated($order->toArray());
        return response()->json($order, 201);
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'table_id' => 'nullable|exists:tables,id',
            'total' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
        ]);

        $oldStatus = $order->status;

        $order->update([
            'customer_id' => $data['customer_id'] ?? $order->customer_id,
            'table_id' => $data['table_id'] ?? $order->table_id,
            'total' => $data['total'] ?? $order->total,
            'payment_method' => $data['payment_method'] ?? $order->payment_method,
            'payment_status' => $data['payment_status'] ?? $order->payment_status,
            'status' => $data['status'] ?? $order->status,
        ]);

        $newStatus = $data['status'] ?? $order->status;

        if ($oldStatus !== 'Cancelled' && $newStatus === 'Cancelled') {
            $this->restoreStock($order);
        }

        if ($newStatus === 'Completed' && $order->payment_status === 'Unpaid' && $order->payment_method) {
            $order->update(['payment_status' => 'Paid']);
        }

        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);
        app(SocketService::class)->orderUpdated($order->toArray());
        return response()->json($order);
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->restoreStock($order);
        $order->delete();
        return response()->json(['message' => 'Order deleted successfully.']);
    }

    public function markPrinted(Order $order): JsonResponse
    {
        $order->increment('print_count');
        $order->update([
            'is_printed' => true,
            'printed_at' => now(),
            'printed_by' => auth()->id(),
        ]);
        return response()->json([
            'print_count' => $order->fresh()->print_count,
            'is_printed' => true,
            'printed_at' => $order->fresh()->printed_at,
            'printed_by' => auth()->id(),
        ]);
    }

    public function checkStock(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.size_id' => 'required|exists:sizes,id',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.addon_id' => 'nullable|exists:addons,id',
        ]);

        $insufficient = [];
        foreach ($data['items'] as $itemData) {
            $qty = $itemData['qty'] ?? 1;
            $recipes = Recipe::where('product_id', $itemData['product_id'])
                ->where('size_id', $itemData['size_id'])
                ->with('ingredient')
                ->get();

            foreach ($recipes as $recipe) {
                if (!$recipe->ingredient) continue;
                $needed = $recipe->quantity * $qty;
                if ($recipe->ingredient->stock_quantity < $needed) {
                    $insufficient[] = sprintf(
                        '%s: need %.2f %s, have %.2f %s',
                        $recipe->ingredient->name,
                        $needed,
                        $recipe->ingredient->unit,
                        $recipe->ingredient->stock_quantity,
                        $recipe->ingredient->unit
                    );
                }
            }

            if (!empty($itemData['addon_id'])) {
                $addonIngredients = AddonIngredient::where('addon_id', $itemData['addon_id'])
                    ->with('ingredient')->get();
                foreach ($addonIngredients as $ai) {
                    if (!$ai->ingredient) continue;
                    $needed = $ai->quantity * $qty;
                    if ($ai->ingredient->stock_quantity < $needed) {
                        $insufficient[] = sprintf(
                            '%s: need %.2f %s, have %.2f %s',
                            $ai->ingredient->name,
                            $needed,
                            $ai->ingredient->unit,
                            $ai->ingredient->stock_quantity,
                            $ai->ingredient->unit
                        );
                    }
                }
            }
        }

        return response()->json([
            'available' => empty($insufficient),
            'errors' => $insufficient,
        ]);
    }

    private function getRecipes(int $productId, int $sizeId): \Illuminate\Database\Eloquent\Collection
    {
        return Recipe::where('product_id', $productId)
            ->where('size_id', $sizeId)
            ->with('ingredient')
            ->get();
    }

    private function restoreStock(Order $order): void
    {
        $order->load('items.addons.addon', 'items.product', 'items.size');

        foreach ($order->items as $item) {
            $qty = $item->qty ?? 1;
            $sizeId = $item->size_id;

            $recipes = $this->getRecipes($item->product_id, $sizeId);
            foreach ($recipes as $recipe) {
                if (!$recipe->ingredient) continue;
                $restoreQty = $recipe->quantity * $qty;
                $recipe->ingredient->increment('stock_quantity', $restoreQty);
                InventoryTransaction::create([
                    'ingredient_id' => $recipe->ingredient_id,
                    'type' => 'deduct',
                    'quantity' => $restoreQty,
                    'note' => "Restored for cancelled Order #{$order->id}",
                ]);
            }

            foreach ($item->addons as $orderAddon) {
                $addonIngredients = AddonIngredient::where('addon_id', $orderAddon->addon_id)->get();
                foreach ($addonIngredients as $ai) {
                    if (!$ai->ingredient) continue;
                    $restoreQty = $ai->quantity * $qty;
                    $ai->ingredient->increment('stock_quantity', $restoreQty);
                    InventoryTransaction::create([
                        'ingredient_id' => $ai->ingredient_id,
                        'type' => 'deduct',
                        'quantity' => $restoreQty,
                        'note' => "Restored for cancelled Order #{$order->id}",
                    ]);
                }
            }
        }
    }
}
