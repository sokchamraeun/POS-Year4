<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index(): JsonResponse
    {
        $recipes = Recipe::with(['product:id,name', 'ingredient:id,name,unit'])->orderBy('id')->paginate(15);
        return response()->json($recipes);
    }

    public function show(Recipe $recipe): JsonResponse
    {
        $recipe->load(['product', 'ingredient']);
        return response()->json($recipe);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);
        $recipe = Recipe::create($data);
        $recipe->load(['product:id,name', 'ingredient:id,name,unit']);
        return response()->json($recipe, 201);
    }

    public function update(Request $request, Recipe $recipe): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);
        $recipe->update($data);
        $recipe->load(['product:id,name', 'ingredient:id,name,unit']);
        return response()->json($recipe);
    }

    public function destroy(Recipe $recipe): JsonResponse
    {
        $recipe->delete();
        return response()->json(['message' => 'Recipe deleted successfully.']);
    }
}
