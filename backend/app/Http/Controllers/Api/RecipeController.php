<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::with(['product:id,category_id,name,image', 'size:id,name', 'ingredient:id,name,unit,cost_per_unit']);

        if ($request->query('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }
        if ($request->query('size_id')) {
            $query->where('size_id', $request->query('size_id'));
        }

        $perPage = min((int) $request->get('per_page', 15), 500);
        $recipes = $query->orderBy('id')->paginate($perPage);

        return response()->json($recipes);
    }

    public function show(Recipe $recipe): JsonResponse
    {
        $recipe->load(['product:id,name,image', 'size', 'ingredient']);

        return response()->json($recipe);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size_id' => 'required|exists:sizes,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
            'cost' => 'nullable|numeric|min:0',
        ]);
        $recipe = Recipe::create($data);
        $recipe->load(['product:id,category_id,name,image', 'size:id,name', 'ingredient:id,name,unit,cost_per_unit']);

        return response()->json($recipe, 201);
    }

    public function update(Request $request, Recipe $recipe): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size_id' => 'required|exists:sizes,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
            'cost' => 'nullable|numeric|min:0',
        ]);
        $recipe->update($data);
        $recipe->load(['product:id,category_id,name,image', 'size:id,name', 'ingredient:id,name,unit,cost_per_unit']);

        return response()->json($recipe);
    }

    public function destroy(Recipe $recipe): JsonResponse
    {
        $recipe->delete();

        return response()->json(['message' => 'Recipe deleted successfully.']);
    }

    public function batchUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size_id' => 'required|exists:sizes,id',
            'recipes' => 'required|array',
            'recipes.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipes.*.quantity' => 'required|numeric|min:0.01',
            'recipes.*.cost' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($data) {
            Recipe::where('product_id', $data['product_id'])
                ->where('size_id', $data['size_id'])
                ->delete();

            foreach ($data['recipes'] as $item) {
                Recipe::create([
                    'product_id' => $data['product_id'],
                    'size_id' => $data['size_id'],
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity' => $item['quantity'],
                    'cost' => $item['cost'] ?? null,
                ]);
            }
        });

        $recipes = Recipe::with(['product:id,category_id,name,image', 'size:id,name', 'ingredient:id,name,unit,cost_per_unit'])
            ->where('product_id', $data['product_id'])
            ->where('size_id', $data['size_id'])
            ->orderBy('id')
            ->get();

        return response()->json(['message' => 'Recipes updated successfully.', 'data' => $recipes]);
    }
}
