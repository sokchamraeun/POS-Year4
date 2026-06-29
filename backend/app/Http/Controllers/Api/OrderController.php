<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCreated;
use App\Events\OrderUpdated;
use App\Http\Controllers\Controller;
use App\Models\AddonIngredient;
use App\Models\Customer;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\Table;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 500);
        $orders = Order::with(['customer', 'table', 'staff', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy'])
            ->orderByDesc('id')->paginate($perPage);

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['customer', 'table', 'staff', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);

        return response()->json($order);
    }

    public function customerHistory(Request $request): JsonResponse
    {
        $data = $request->validate(['phone' => 'required|string']);
        $customer = Customer::where('phone', $data['phone'])->first();
        if (! $customer) {
            return response()->json(['data' => [], 'message' => 'No orders found']);
        }
        $orders = Order::with(['customer', 'table', 'staff', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->paginate(10);

        return response()->json($orders);
    }

    public function userHistory(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email']);
        $user = User::where('email', $data['email'])->first();
        if (! $user) {
            return response()->json(['data' => [], 'message' => 'No orders found']);
        }
        $orders = Order::with(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon'])
            ->whereHas('customer', fn ($q) => $q->where('name', $user->name))
            ->orWhereHas('customer', fn ($q) => $q->where('phone', $user->email))
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
            'discount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'payment_status' => 'nullable|string|max:50',
            'status' => 'nullable|string|max:50',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.size_id' => 'required|exists:sizes,id',
            'items.*.sugar_level_id' => 'nullable|exists:sugar_levels,id',
            'items.*.sugar_note' => 'nullable|string|max:255',
            'items.*.ice_level_id' => 'nullable|exists:ice_levels,id',
            'items.*.ice_note' => 'nullable|string|max:255',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
            'items.*.addons' => 'nullable|array',
            'items.*.addons.*.addon_id' => 'required|exists:addons,id',
            'items.*.addons.*.price' => 'nullable|numeric|min:0',
            'items.*.promotion_snapshot' => 'nullable',
        ]);

        $productSizePairs = collect($data['items'])->map(fn ($i) => ['product_id' => $i['product_id'], 'size_id' => $i['size_id'] ?? null])->unique();
        $allRecipes = Recipe::with('ingredient')
            ->whereIn('product_id', $productSizePairs->pluck('product_id'))
            ->whereIn('size_id', $productSizePairs->pluck('size_id'))
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.$r->size_id);

        $addonIds = collect($data['items'])->pluck('addons')->flatten(1)->pluck('addon_id')->unique()->filter();
        $allAddonIngredients = collect();
        if ($addonIds->isNotEmpty()) {
            $allAddonIngredients = AddonIngredient::with('ingredient')
                ->whereIn('addon_id', $addonIds)
                ->get()
                ->groupBy('addon_id');
        }

        $insufficient = [];
        foreach ($data['items'] as $itemData) {
            $qty = $itemData['qty'] ?? 1;
            $sizeId = $itemData['size_id'] ?? null;
            $key = $itemData['product_id'].'-'.$sizeId;

            $recipes = $allRecipes->get($key, collect());
            foreach ($recipes as $recipe) {
                if (! $recipe?->ingredient) {
                    continue;
                }
                $needed = $recipe->quantity * $qty;
                if ($recipe->ingredient->stock_quantity < $needed) {
                    $insufficient[] = "{$recipe->ingredient->name}: need {$needed} {$recipe->ingredient->unit}, have {$recipe->ingredient->stock_quantity} {$recipe->ingredient->unit}";
                }
            }

            foreach (($itemData['addons'] ?? []) as $addonData) {
                $addonIngredients = $allAddonIngredients->get($addonData['addon_id'], collect());
                foreach ($addonIngredients as $ai) {
                    if (! $ai?->ingredient) {
                        continue;
                    }
                    $needed = $ai->quantity * $qty;
                    if ($ai->ingredient->stock_quantity < $needed) {
                        $insufficient[] = "{$ai->ingredient->name}: need {$needed} {$ai->ingredient->unit}, have {$ai->ingredient->stock_quantity} {$ai->ingredient->unit}";
                    }
                }
            }
        }

        if (! empty($insufficient)) {
            return response()->json(['message' => 'Insufficient ingredient stock', 'errors' => $insufficient], 422);
        }

        // The store route is public (POS may post without the sanctum middleware group),
        // so resolve the authenticated cashier on demand via the sanctum guard.
        $staffId = auth('sanctum')->id();

        $order = DB::transaction(function () use ($data, $allRecipes, $allAddonIngredients, $staffId) {
            $discount = $data['discount'] ?? 0;

            $order = Order::create([
                'customer_id' => $data['customer_id'] ?? null,
                'staff_id' => $staffId,
                'table_id' => $data['table_id'] ?? null,
                'total' => $data['total'],
                'discount' => $discount,
                'payment_method' => $data['payment_method'] ?? null,
                'payment_status' => $data['payment_status'] ?? null,
                'status' => $data['status'] ?? null,
            ]);

            $transactions = [];

            foreach ($data['items'] as $itemData) {
                $qty = $itemData['qty'] ?? 1;
                $sizeId = $itemData['size_id'] ?? null;
                $key = $itemData['product_id'].'-'.$sizeId;

                $item = $order->items()->create([
                    'product_id' => $itemData['product_id'],
                    'size_id' => $itemData['size_id'],
                    'sugar_level_id' => $itemData['sugar_level_id'] ?? null,
                    'sugar_note' => $itemData['sugar_note'] ?? null,
                    'ice_level_id' => $itemData['ice_level_id'] ?? null,
                    'ice_note' => $itemData['ice_note'] ?? null,
                    'qty' => $qty,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'subtotal' => $itemData['subtotal'] ?? 0,
                    'promotion_snapshot' => $itemData['promotion_snapshot'] ?? null,
                ]);

                foreach (($itemData['addons'] ?? []) as $addonData) {
                    $item->addons()->create([
                        'addon_id' => $addonData['addon_id'],
                        'price' => $addonData['price'] ?? 0,
                    ]);
                }

                $recipes = $allRecipes->get($key, collect());
                foreach ($recipes as $recipe) {
                    if (! $recipe?->ingredient) {
                        continue;
                    }
                    $deductQty = $recipe->quantity * $qty;
                    $recipe->ingredient->decrement('stock_quantity', $deductQty);
                    $transactions[] = [
                        'ingredient_id' => $recipe->ingredient_id,
                        'type' => 'deduct',
                        'quantity' => -$deductQty,
                        'note' => "Auto-deducted for Order #{$order->id}",
                    ];
                }

                foreach (($itemData['addons'] ?? []) as $addonData) {
                    $addonIngredients = $allAddonIngredients->get($addonData['addon_id'], collect());
                    foreach ($addonIngredients as $ai) {
                        if (! $ai?->ingredient) {
                            continue;
                        }
                        $deductQty = $ai->quantity * $qty;
                        $ai->ingredient->decrement('stock_quantity', $deductQty);
                        $transactions[] = [
                            'ingredient_id' => $ai->ingredient_id,
                            'type' => 'deduct',
                            'quantity' => -$deductQty,
                            'note' => "Auto-deducted for Order #{$order->id}",
                        ];
                    }
                }
            }

            if (! empty($transactions)) {
                InventoryTransaction::insert($transactions);
            }

            return $order;
        });

        dispatch_broadcast(new OrderCreated($order));

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

        if ($oldStatus !== 'Completed' && $newStatus === 'Completed') {
            $this->deductStock($order);
        }

        if ($oldStatus !== 'Cancelled' && $newStatus === 'Cancelled') {
            $this->restoreStock($order);
        }

        if ($newStatus === 'Completed' && $order->payment_status === 'Unpaid' && $order->payment_method) {
            $order->update(['payment_status' => 'Paid']);
        }

        // Free the table for cleaning only once the order is fully done:
        // Completed AND Paid, or Cancelled.
        $completedAndPaid = $newStatus === 'Completed' && $order->payment_status === 'Paid';

        if (($completedAndPaid || $newStatus === 'Cancelled') && $order->table_id) {
            $order->table->update(['status' => Table::STATUS_CLEANING]);
        }

        dispatch_broadcast(new OrderUpdated($order));

        return response()->json($order);
    }

    public function destroy(Order $order): JsonResponse
    {
        $this->restoreStock($order);
        $order->delete();

        return response()->json(['message' => 'Order deleted successfully.']);
    }

    public function generateKhqrQr(Order $order): JsonResponse
    {
        if ($order->payment_method !== 'KHQR') {
            return response()->json([
                'status' => 'error',
                'message' => 'Order payment method is not KHQR',
            ], 422);
        }

        $total = (float) $order->total;

        $individualInfo = new IndividualInfo(
            'sok_chamraeun@bkrt',
            'CHAMRAEUN SOK',
            'PHNOM PENH',
            null,
            null,
            KHQRData::CURRENCY_USD,
            $total,
            (string) $order->id,
            'POS Store',
        );

        $khqrResponse = BakongKHQR::generateIndividual($individualInfo);
        $qrString = null;

        if ($khqrResponse->status['code'] === 0) {
            $qrString = $khqrResponse->data['qr'];
        }

        if (! $order->payment_reference) {
            $order->update([
                'payment_reference' => 'ORD_'.$order->id.'_'.time(),
            ]);
        }

        return response()->json([
            'status' => 'ok',
            'qr' => $qrString,
            'order_id' => $order->id,
            'total' => $total,
            'md5' => $khqrResponse->data['md5'] ?? null,
        ]);
    }

    public function addItems(Request $request, Order $order): JsonResponse
    {
        if (! in_array($order->status, ['Open', 'New']) || ! in_array($order->payment_status, [null, 'Unpaid', 'unpaid', 'pending'])) {
            return response()->json(['message' => 'Order is not open for adding items.'], 422);
        }

        $data = $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.size_id' => 'required|exists:sizes,id',
            'items.*.sugar_level_id' => 'nullable|exists:sugar_levels,id',
            'items.*.sugar_note' => 'nullable|string|max:255',
            'items.*.ice_level_id' => 'nullable|exists:ice_levels,id',
            'items.*.ice_note' => 'nullable|string|max:255',
            'items.*.qty' => 'nullable|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.subtotal' => 'nullable|numeric|min:0',
            'items.*.addons' => 'nullable|array',
            'items.*.addons.*.addon_id' => 'required|exists:addons,id',
            'items.*.addons.*.price' => 'nullable|numeric|min:0',
            'items.*.promotion_snapshot' => 'nullable',
            'discount' => 'nullable|numeric|min:0',
        ]);

        $productSizePairs = collect($data['items'])->map(fn ($i) => ['product_id' => $i['product_id'], 'size_id' => $i['size_id'] ?? null])->unique();
        $allRecipes = Recipe::with('ingredient')
            ->whereIn('product_id', $productSizePairs->pluck('product_id'))
            ->whereIn('size_id', $productSizePairs->pluck('size_id'))
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.$r->size_id);

        $addonIds = collect($data['items'])->pluck('addons')->flatten(1)->pluck('addon_id')->unique()->filter();
        $allAddonIngredients = collect();
        if ($addonIds->isNotEmpty()) {
            $allAddonIngredients = AddonIngredient::with('ingredient')
                ->whereIn('addon_id', $addonIds)
                ->get()
                ->groupBy('addon_id');
        }

        $insufficient = [];
        foreach ($data['items'] as $itemData) {
            $qty = $itemData['qty'] ?? 1;
            $sizeId = $itemData['size_id'] ?? null;
            $key = $itemData['product_id'].'-'.$sizeId;

            $recipes = $allRecipes->get($key, collect());
            foreach ($recipes as $recipe) {
                if (! $recipe?->ingredient) {
                    continue;
                }
                $needed = $recipe->quantity * $qty;
                if ($recipe->ingredient->stock_quantity < $needed) {
                    $insufficient[] = "{$recipe->ingredient->name}: need {$needed} {$recipe->ingredient->unit}, have {$recipe->ingredient->stock_quantity} {$recipe->ingredient->unit}";
                }
            }

            foreach (($itemData['addons'] ?? []) as $addonData) {
                $addonIngredients = $allAddonIngredients->get($addonData['addon_id'], collect());
                foreach ($addonIngredients as $ai) {
                    if (! $ai?->ingredient) {
                        continue;
                    }
                    $needed = $ai->quantity * $qty;
                    if ($ai->ingredient->stock_quantity < $needed) {
                        $insufficient[] = "{$ai->ingredient->name}: need {$needed} {$ai->ingredient->unit}, have {$ai->ingredient->stock_quantity} {$ai->ingredient->unit}";
                    }
                }
            }
        }

        if (! empty($insufficient)) {
            return response()->json(['message' => 'Insufficient ingredient stock', 'errors' => $insufficient], 422);
        }

        $order = DB::transaction(function () use ($data, $order, $allRecipes, $allAddonIngredients) {
            $itemsTotal = 0;
            $transactions = [];

            foreach ($data['items'] as $itemData) {
                $qty = $itemData['qty'] ?? 1;
                $sizeId = $itemData['size_id'] ?? null;
                $subtotal = $itemData['subtotal'] ?? ($itemData['unit_price'] ?? 0) * $qty;
                $key = $itemData['product_id'].'-'.$sizeId;

                $item = $order->items()->create([
                    'product_id' => $itemData['product_id'],
                    'size_id' => $itemData['size_id'],
                    'sugar_level_id' => $itemData['sugar_level_id'] ?? null,
                    'sugar_note' => $itemData['sugar_note'] ?? null,
                    'ice_level_id' => $itemData['ice_level_id'] ?? null,
                    'ice_note' => $itemData['ice_note'] ?? null,
                    'qty' => $qty,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'subtotal' => $subtotal,
                    'promotion_snapshot' => $itemData['promotion_snapshot'] ?? null,
                ]);

                foreach (($itemData['addons'] ?? []) as $addonData) {
                    $item->addons()->create([
                        'addon_id' => $addonData['addon_id'],
                        'price' => $addonData['price'] ?? 0,
                    ]);
                }

                $recipes = $allRecipes->get($key, collect());
                foreach ($recipes as $recipe) {
                    if (! $recipe?->ingredient) {
                        continue;
                    }
                    $deductQty = $recipe->quantity * $qty;
                    $recipe->ingredient->decrement('stock_quantity', $deductQty);
                    $transactions[] = [
                        'ingredient_id' => $recipe->ingredient_id,
                        'type' => 'deduct',
                        'quantity' => -$deductQty,
                        'note' => "Auto-deducted for Order #{$order->id}",
                    ];
                }

                foreach (($itemData['addons'] ?? []) as $addonData) {
                    $addonIngredients = $allAddonIngredients->get($addonData['addon_id'], collect());
                    foreach ($addonIngredients as $ai) {
                        if (! $ai?->ingredient) {
                            continue;
                        }
                        $deductQty = $ai->quantity * $qty;
                        $ai->ingredient->decrement('stock_quantity', $deductQty);
                        $transactions[] = [
                            'ingredient_id' => $ai->ingredient_id,
                            'type' => 'deduct',
                            'quantity' => -$deductQty,
                            'note' => "Auto-deducted for Order #{$order->id}",
                        ];
                    }
                }

                $itemsTotal += $subtotal;
            }

            if (! empty($transactions)) {
                InventoryTransaction::insert($transactions);
            }

            $discount = $data['discount'] ?? 0;
            $order->increment('total', max(0, $itemsTotal - $discount));

            if ($discount > 0) {
                $order->increment('discount', $discount);
            }

            dispatch_broadcast(new OrderUpdated($order));

            return $order->fresh()->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        });

        return response()->json($order);
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

        $productSizePairs = collect($data['items'])->map(fn ($i) => ['product_id' => $i['product_id'], 'size_id' => $i['size_id']])->unique();
        $allRecipes = Recipe::with('ingredient')
            ->whereIn('product_id', $productSizePairs->pluck('product_id'))
            ->whereIn('size_id', $productSizePairs->pluck('size_id'))
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.$r->size_id);

        $addonIds = collect($data['items'])->pluck('addon_id')->unique()->filter();
        $allAddonIngredients = collect();
        if ($addonIds->isNotEmpty()) {
            $allAddonIngredients = AddonIngredient::with('ingredient')
                ->whereIn('addon_id', $addonIds)
                ->get()
                ->groupBy('addon_id');
        }

        $insufficient = [];
        foreach ($data['items'] as $itemData) {
            $qty = $itemData['qty'] ?? 1;
            $key = $itemData['product_id'].'-'.$itemData['size_id'];

            $recipes = $allRecipes->get($key, collect());
            foreach ($recipes as $recipe) {
                if (! $recipe->ingredient) {
                    continue;
                }
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

            if (! empty($itemData['addon_id'])) {
                $addonIngredients = $allAddonIngredients->get($itemData['addon_id'], collect());
                foreach ($addonIngredients as $ai) {
                    if (! $ai->ingredient) {
                        continue;
                    }
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

    private function deductStock(Order $order): void
    {
        $order->load('items.addons.addon', 'items.product', 'items.size');

        $productSizePairs = $order->items->map(fn ($i) => ['product_id' => $i->product_id, 'size_id' => $i->size_id])->unique();
        $allRecipes = Recipe::with('ingredient')
            ->whereIn('product_id', $productSizePairs->pluck('product_id'))
            ->whereIn('size_id', $productSizePairs->pluck('size_id'))
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.$r->size_id);

        $addonIds = $order->items->flatMap(fn ($i) => $i->addons->pluck('addon_id'))->unique()->filter();
        $allAddonIngredients = collect();
        if ($addonIds->isNotEmpty()) {
            $allAddonIngredients = AddonIngredient::with('ingredient')
                ->whereIn('addon_id', $addonIds)
                ->get()
                ->groupBy('addon_id');
        }

        $transactions = [];

        foreach ($order->items as $item) {
            $qty = $item->qty ?? 1;
            $key = $item->product_id.'-'.$item->size_id;

            $recipes = $allRecipes->get($key, collect());
            foreach ($recipes as $recipe) {
                if (! $recipe->ingredient) {
                    continue;
                }
                $deductQty = $recipe->quantity * $qty;
                $recipe->ingredient->decrement('stock_quantity', $deductQty);
                $transactions[] = [
                    'ingredient_id' => $recipe->ingredient_id,
                    'type' => 'deduct',
                    'quantity' => $deductQty,
                    'note' => "Deducted for completed Order #{$order->id}",
                ];
            }

            foreach ($item->addons as $orderAddon) {
                $addonIngredients = $allAddonIngredients->get($orderAddon->addon_id, collect());
                foreach ($addonIngredients as $ai) {
                    if (! $ai->ingredient) {
                        continue;
                    }
                    $deductQty = $ai->quantity * $qty;
                    $ai->ingredient->decrement('stock_quantity', $deductQty);
                    $transactions[] = [
                        'ingredient_id' => $ai->ingredient_id,
                        'type' => 'deduct',
                        'quantity' => $deductQty,
                        'note' => "Deducted for completed Order #{$order->id} (addon)",
                    ];
                }
            }
        }

        if (! empty($transactions)) {
            InventoryTransaction::insert($transactions);
        }
    }

    private function restoreStock(Order $order): void
    {
        $order->load('items.addons.addon', 'items.product', 'items.size');

        $productSizePairs = $order->items->map(fn ($i) => ['product_id' => $i->product_id, 'size_id' => $i->size_id])->unique();
        $allRecipes = Recipe::with('ingredient')
            ->whereIn('product_id', $productSizePairs->pluck('product_id'))
            ->whereIn('size_id', $productSizePairs->pluck('size_id'))
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.$r->size_id);

        $addonIds = $order->items->flatMap(fn ($i) => $i->addons->pluck('addon_id'))->unique()->filter();
        $allAddonIngredients = collect();
        if ($addonIds->isNotEmpty()) {
            $allAddonIngredients = AddonIngredient::with('ingredient')
                ->whereIn('addon_id', $addonIds)
                ->get()
                ->groupBy('addon_id');
        }

        $transactions = [];

        foreach ($order->items as $item) {
            $qty = $item->qty ?? 1;
            $key = $item->product_id.'-'.$item->size_id;

            $recipes = $allRecipes->get($key, collect());
            foreach ($recipes as $recipe) {
                if (! $recipe->ingredient) {
                    continue;
                }
                $restoreQty = $recipe->quantity * $qty;
                $recipe->ingredient->increment('stock_quantity', $restoreQty);
                $transactions[] = [
                    'ingredient_id' => $recipe->ingredient_id,
                    'type' => 'deduct',
                    'quantity' => $restoreQty,
                    'note' => "Restored for cancelled Order #{$order->id}",
                ];
            }

            foreach ($item->addons as $orderAddon) {
                $addonIngredients = $allAddonIngredients->get($orderAddon->addon_id, collect());
                foreach ($addonIngredients as $ai) {
                    if (! $ai->ingredient) {
                        continue;
                    }
                    $restoreQty = $ai->quantity * $qty;
                    $ai->ingredient->increment('stock_quantity', $restoreQty);
                    $transactions[] = [
                        'ingredient_id' => $ai->ingredient_id,
                        'type' => 'deduct',
                        'quantity' => $restoreQty,
                        'note' => "Restored for cancelled Order #{$order->id}",
                    ];
                }
            }
        }

        if (! empty($transactions)) {
            InventoryTransaction::insert($transactions);
        }
    }
}
