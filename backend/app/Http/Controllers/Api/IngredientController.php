<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index(): JsonResponse
    {
        $ingredients = Ingredient::withCount('inventoryTransactions')->orderBy('id')->paginate(10);
        return response()->json($ingredients);
    }

    public function show(Ingredient $ingredient): JsonResponse
    {
        $ingredient->load(['products', 'inventoryTransactions' => fn ($q) => $q->latest()->limit(10)]);
        return response()->json($ingredient);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
        ]);
        $ingredient = Ingredient::create($data);
        return response()->json($ingredient, 201);
    }

    public function update(Request $request, Ingredient $ingredient): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
        ]);
        $ingredient->update($data);
        return response()->json($ingredient);
    }

    public function destroy(Ingredient $ingredient): JsonResponse
    {
        $ingredient->delete();
        return response()->json(['message' => 'Ingredient deleted successfully.']);
    }
}
