<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\AddonIngredient;
use App\Models\Ingredient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddonIngredientController extends Controller
{
    public function index(): JsonResponse
    {
        $addons = Addon::with(['ingredients' => function ($q) {
            $q->orderBy('ingredients.name');
        }])->orderBy('name')->paginate(15);

        return response()->json($addons);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'addon_id' => 'required|exists:addons,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $addonIngredient = AddonIngredient::updateOrCreate(
            [
                'addon_id' => $data['addon_id'],
                'ingredient_id' => $data['ingredient_id'],
            ],
            ['quantity' => $data['quantity']]
        );

        return response()->json($addonIngredient, 201);
    }

    public function update(Request $request, AddonIngredient $addonIngredient): JsonResponse
    {
        $data = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $addonIngredient->update($data);

        return response()->json($addonIngredient);
    }

    public function destroy(AddonIngredient $addonIngredient): JsonResponse
    {
        $addonIngredient->delete();
        return response()->json(['message' => 'Addon ingredient deleted successfully.']);
    }
}
