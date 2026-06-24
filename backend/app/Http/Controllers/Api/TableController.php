<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = Table::withCount('orders')->orderBy('name')->paginate(10);

        return response()->json($tables);
    }

    public function show(Table $table): JsonResponse
    {
        $table->loadCount('orders');

        return response()->json($table);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|string|max:50',
        ]);

        $table = Table::create([
            'name' => $data['name'],
            'capacity' => $data['capacity'],
            'status' => $data['status'] ?? 'available',
        ]);

        return response()->json($table, 201);
    }

    public function update(Request $request, Table $table): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|string|max:50',
        ]);

        $table->update([
            'name' => $data['name'],
            'capacity' => $data['capacity'],
            'status' => $data['status'] ?? 'available',
        ]);

        return response()->json($table);
    }

    public function destroy(Table $table): JsonResponse
    {
        $table->delete();

        return response()->json(['message' => 'Table deleted successfully.']);
    }

    public function available(): JsonResponse
    {
        $tables = Table::where('status', 'available')->orderBy('name')->get();

        return response()->json($tables);
    }

    public function byToken(string $qrToken): JsonResponse
    {
        $table = Table::where('qr_token', $qrToken)->first();

        if (! $table) {
            return response()->json(['message' => 'Invalid QR token.'], 404);
        }

        $table->loadCount('orders');

        $order = $table->currentOrder();

        if (! $order) {
            $order = DB::transaction(function () use ($table) {
                $order = Order::create([
                    'table_id' => $table->id,
                    'total' => 0,
                    'status' => 'Open',
                    'payment_status' => 'Unpaid',
                ]);

                $table->update(['status' => Table::STATUS_OCCUPIED]);

                return $order;
            });
        }

        return response()->json([
            'table' => $table,
            'order' => $order,
        ]);
    }

    /**
     * Read-only: while the table is still occupied, return the order history for
     * that table so a QR customer can review it (no phone/login required, and
     * never creates an order). Returns an empty list once the table is freed.
     */
    public function currentOrderByToken(string $qrToken): JsonResponse
    {
        $table = Table::where('qr_token', $qrToken)->first();

        if (! $table) {
            return response()->json(['message' => 'Invalid QR token.'], 404);
        }

        $current = $table->currentOrder();

        // Only expose the latest open order, and only while the table is still
        // occupied. Once it is paid/freed, currentOrder() is null -> empty list.
        if (! $current) {
            return response()->json(['table' => $table, 'order' => null, 'orders' => []]);
        }

        $current->load(['table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);

        return response()->json(['table' => $table, 'order' => $current, 'orders' => [$current]]);
    }

    public function currentOrderByTable(Table $table): JsonResponse
    {
        $order = $table->currentOrder();

        if ($order) {
            $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        }

        return response()->json([
            'table' => $table,
            'order' => $order,
        ]);
    }

    public function addOrderItems(Request $request, string $qrToken): JsonResponse
    {
        $table = Table::where('qr_token', $qrToken)->first();

        if (! $table) {
            return response()->json(['message' => 'Invalid QR token.'], 404);
        }

        // TEMP DEBUG: log exactly what the customer's device sends so we can see
        // whether promotion_snapshot/discount arrive. Remove once verified.
        \Log::info('QR order-items payload', [
            'discount' => $request->input('discount'),
            'items' => collect($request->input('items', []))->map(fn ($i) => [
                'product_id' => $i['product_id'] ?? null,
                'qty' => $i['qty'] ?? null,
                'promotion_snapshot' => $i['promotion_snapshot'] ?? 'MISSING',
            ]),
        ]);

        $data = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
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

        $order = DB::transaction(function () use ($table, $data) {
            $order = $table->currentOrder();

            if (! $order) {
                $order = Order::create([
                    'customer_id' => $data['customer_id'] ?? null,
                    'table_id' => $table->id,
                    'total' => 0,
                    'status' => 'Open',
                    'payment_status' => 'Unpaid',
                ]);

                $table->update(['status' => Table::STATUS_OCCUPIED]);
            }

            $itemsTotal = 0;

            foreach ($data['items'] as $itemData) {
                $qty = $itemData['qty'] ?? 1;
                $subtotal = $itemData['subtotal'] ?? ($itemData['unit_price'] ?? 0) * $qty;

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

                $itemsTotal += $subtotal;
            }

            $discount = $data['discount'] ?? 0;

            $order->increment('total', max(0, $itemsTotal - $discount));

            if ($discount > 0) {
                $order->increment('discount', $discount);
            }

            return $order->fresh()->load(['items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        });

        return response()->json($order, 201);
    }
}
