<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 10);
        $ingredients = Ingredient::withCount('inventoryTransactions')->orderBy('id')->paginate($perPage);

        return response()->json($ingredients);
    }

    public function show(Ingredient $ingredient): JsonResponse
    {
        $ingredient->load(['products', 'inventoryTransactions' => fn ($q) => $q->latest()->limit(10)]);

        return response()->json($ingredient);
    }

    public function store(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'image' => 'nullable|image|max:2048',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $cloudinary->upload($request->file('image'), 'ingredients');
        } else {
            unset($data['image']);
        }

        $ingredient = Ingredient::create($data);

        return response()->json($ingredient, 201);
    }

    public function update(Request $request, Ingredient $ingredient, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'image' => 'nullable|image|max:2048',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            if ($ingredient->image) {
                $cloudinary->delete($ingredient->image);
            }
            $data['image'] = $cloudinary->upload($request->file('image'), 'ingredients');
        } else {
            unset($data['image']);
        }

        $ingredient->update($data);

        return response()->json($ingredient);
    }

    public function destroy(Ingredient $ingredient, CloudinaryService $cloudinary): JsonResponse
    {
        if ($ingredient->image) {
            $cloudinary->delete($ingredient->image);
        }

        $ingredient->delete();

        return response()->json(['message' => 'Ingredient deleted successfully.']);
    }
}
