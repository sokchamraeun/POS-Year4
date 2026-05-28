<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        $ingredients = Ingredient::withCount('inventoryTransactions')->orderBy('name')->get();
        $lowStock = $ingredients->filter(fn ($i) => $i->stock_quantity <= $i->reorder_level);

        return view('inventory.index', compact('ingredients', 'lowStock'));
    }

    public function create(Request $request)
    {
        $ingredients = Ingredient::orderBy('name')->get();
        $selectedIngredientId = $request->query('ingredient_id');

        return view('inventory.create', compact('ingredients', 'selectedIngredientId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'type' => 'required|string|in:purchase,deduct,adjust',
            'quantity' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:1000',
        ]);

        $ingredient = Ingredient::findOrFail($data['ingredient_id']);

        if ($data['type'] === 'deduct' && $data['quantity'] > $ingredient->stock_quantity) {
            return back()->withErrors(['quantity' => 'Cannot deduct more than current stock ('.number_format($ingredient->stock_quantity, 2).').'])->withInput();
        }

        $change = match ($data['type']) {
            'purchase' => $data['quantity'],
            'deduct' => -$data['quantity'],
            'adjust' => $data['quantity'],
        };

        $ingredient->increment('stock_quantity', $change);

        InventoryTransaction::create([
            'ingredient_id' => $data['ingredient_id'],
            'type' => $data['type'],
            'quantity' => $change,
            'note' => $data['note'] ?? null,
        ]);

        return redirect()->route('inventory.index')->with('success', 'Stock updated successfully.');
    }

    public function history()
    {
        $transactions = InventoryTransaction::with('ingredient')->orderByDesc('id')->paginate(20);

        return view('inventory.history', compact('transactions'));
    }
}
