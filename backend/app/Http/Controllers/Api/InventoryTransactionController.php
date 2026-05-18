<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryTransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = InventoryTransaction::with('ingredient:id,name,unit')
            ->orderByDesc('id')->paginate(20);
        return response()->json($transactions);
    }

    public function show(InventoryTransaction $inventoryTransaction): JsonResponse
    {
        $inventoryTransaction->load('ingredient');
        return response()->json($inventoryTransaction);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'type' => 'required|string|in:purchase,deduct,adjust',
            'quantity' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:1000',
        ]);

        $ingredient = Ingredient::findOrFail($data['ingredient_id']);

        if ($data['type'] === 'deduct' && $data['quantity'] > $ingredient->stock_quantity) {
            return response()->json([
                'message' => 'Cannot deduct more than current stock (' . number_format($ingredient->stock_quantity, 2) . ').',
            ], 422);
        }

        $change = match ($data['type']) {
            'purchase' => $data['quantity'],
            'deduct' => -$data['quantity'],
            'adjust' => $data['quantity'],
        };

        $ingredient->increment('stock_quantity', $change);

        $transaction = InventoryTransaction::create([
            'ingredient_id' => $data['ingredient_id'],
            'type' => $data['type'],
            'quantity' => $change,
            'note' => $data['note'] ?? null,
        ]);

        $transaction->load('ingredient:id,name,unit');
        return response()->json($transaction, 201);
    }

    public function destroy(InventoryTransaction $inventoryTransaction): JsonResponse
    {
        $inventoryTransaction->delete();
        return response()->json(['message' => 'Transaction deleted successfully.']);
    }
}
