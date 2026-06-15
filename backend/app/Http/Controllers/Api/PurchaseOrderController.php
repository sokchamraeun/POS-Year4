<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PurchaseOrder::with('supplier:id,name', 'user:id,name')
            ->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        return response()->json($query->orderByDesc('id')->get());
    }

    public function show(PurchaseOrder $purchaseOrder): JsonResponse
    {
        return response()->json(
            $purchaseOrder->load('supplier:id,name,phone', 'user:id,name', 'items.ingredient:id,name,unit')
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'supplier_id'   => 'required|exists:suppliers,id',
            'purchase_date' => 'required|date',
            'status'        => 'in:Pending,Received,Cancelled',
            'note'          => 'nullable|string',
            'items'         => 'required|array|min:1',
            'items.*.ingredient_id' => 'required|exists:ingredients,id',
            'items.*.quantity'      => 'required|numeric|min:0.01',
            'items.*.unit_cost'     => 'required|numeric|min:0',
            'items.*.subtotal'      => 'required|numeric|min:0',
        ]);

        $po = DB::transaction(function () use ($data, $request) {
            $total = collect($data['items'])->sum('subtotal');

            $po = PurchaseOrder::create([
                'supplier_id'   => $data['supplier_id'],
                'user_id'       => $request->user()->id,
                'purchase_date' => $data['purchase_date'],
                'total_amount'  => $total,
                'status'        => $data['status'] ?? 'Pending',
                'note'          => $data['note'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'ingredient_id'     => $item['ingredient_id'],
                    'quantity'          => $item['quantity'],
                    'unit_cost'         => $item['unit_cost'],
                    'subtotal'          => $item['subtotal'],
                ]);
            }

            if ($po->status === 'Received') {
                $this->receiveStock($po, $request->user()->id);
            }

            return $po;
        });

        return response()->json(
            $po->load('supplier:id,name', 'user:id,name', 'items.ingredient:id,name,unit'),
            201
        );
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $data = $request->validate([
            'supplier_id'   => 'sometimes|exists:suppliers,id',
            'purchase_date' => 'sometimes|date',
            'status'        => 'sometimes|in:Pending,Received,Cancelled',
            'note'          => 'nullable|string',
            'items'         => 'sometimes|array|min:1',
            'items.*.ingredient_id' => 'required_with:items|exists:ingredients,id',
            'items.*.quantity'      => 'required_with:items|numeric|min:0.01',
            'items.*.unit_cost'     => 'required_with:items|numeric|min:0',
            'items.*.subtotal'      => 'required_with:items|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $purchaseOrder, $request) {
            $oldStatus = $purchaseOrder->status;
            $newStatus = $data['status'] ?? $oldStatus;

            if (isset($data['items'])) {
                $total = collect($data['items'])->sum('subtotal');
                $data['total_amount'] = $total;
                $purchaseOrder->items()->delete();
                foreach ($data['items'] as $item) {
                    PurchaseOrderItem::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'ingredient_id'     => $item['ingredient_id'],
                        'quantity'          => $item['quantity'],
                        'unit_cost'         => $item['unit_cost'],
                        'subtotal'          => $item['subtotal'],
                    ]);
                }
            }

            unset($data['items']);
            $purchaseOrder->update($data);

            // Pending/Cancelled → Received: add stock
            if ($oldStatus !== 'Received' && $newStatus === 'Received') {
                $this->receiveStock($purchaseOrder, $request->user()->id);
            }

            // Received → Cancelled: reverse stock
            if ($oldStatus === 'Received' && $newStatus === 'Cancelled') {
                $this->reverseStock($purchaseOrder, $request->user()->id);
            }
        });

        return response()->json(
            $purchaseOrder->fresh()->load('supplier:id,name', 'user:id,name', 'items.ingredient:id,name,unit')
        );
    }

    public function destroy(PurchaseOrder $purchaseOrder): JsonResponse
    {
        if ($purchaseOrder->status === 'Received') {
            return response()->json(['message' => 'Cannot delete a received purchase order. Cancel it first.'], 422);
        }

        $purchaseOrder->delete();

        return response()->json(['message' => 'Purchase order deleted successfully.']);
    }

    private function receiveStock(PurchaseOrder $po, ?int $userId): void
    {
        $po->load('items.ingredient');

        foreach ($po->items as $item) {
            if (! $item->ingredient) continue;

            $item->ingredient->increment('stock_quantity', $item->quantity);

            StockMovement::create([
                'ingredient_id'  => $item->ingredient_id,
                'type'           => 'IN',
                'quantity'       => $item->quantity,
                'reference_type' => 'purchase_order',
                'reference_id'   => $po->id,
                'note'           => "Stock in from PO #{$po->id} — {$item->ingredient->name}",
                'created_by'     => $userId,
            ]);

            InventoryTransaction::create([
                'ingredient_id' => $item->ingredient_id,
                'type'          => 'add',
                'quantity'      => $item->quantity,
                'note'          => "Received from PO #{$po->id} — {$item->ingredient->name}",
            ]);
        }
    }

    private function reverseStock(PurchaseOrder $po, ?int $userId): void
    {
        $po->load('items.ingredient');

        foreach ($po->items as $item) {
            if (! $item->ingredient) continue;

            $item->ingredient->decrement('stock_quantity', $item->quantity);

            StockMovement::create([
                'ingredient_id'  => $item->ingredient_id,
                'type'           => 'ADJUST',
                'quantity'       => -$item->quantity,
                'reference_type' => 'purchase_order',
                'reference_id'   => $po->id,
                'note'           => "Reversed: PO #{$po->id} cancelled",
                'created_by'     => $userId,
            ]);

            InventoryTransaction::create([
                'ingredient_id' => $item->ingredient_id,
                'type'          => 'deduct',
                'quantity'      => $item->quantity,
                'note'          => "Stock reversed: PO #{$po->id} cancelled — {$item->ingredient->name}",
            ]);
        }
    }
}
