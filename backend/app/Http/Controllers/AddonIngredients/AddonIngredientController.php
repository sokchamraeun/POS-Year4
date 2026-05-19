<?php

namespace App\Http\Controllers\AddonIngredients;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\AddonIngredient;
use App\Models\Ingredient;
use Illuminate\Http\Request;

class AddonIngredientController extends Controller
{
    public function index()
    {
        $addons = Addon::with(['ingredients' => function ($q) {
            $q->orderBy('ingredients.name');
        }])->orderBy('name')->paginate(15);
        return view('addon-ingredients.index', compact('addons'));
    }

    public function create(Request $request)
    {
        $addons = Addon::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();
        $selectedAddonId = $request->query('addon_id');
        return view('addon-ingredients.create', compact('addons', 'ingredients', 'selectedAddonId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'addon_id' => 'required|exists:addons,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        AddonIngredient::create($data);

        return redirect()->route('addon-ingredients.index')->with('success', 'Addon ingredient created successfully.');
    }

    public function show(AddonIngredient $addonIngredient)
    {
        $addonIngredient->load(['addon', 'ingredient']);
        return view('addon-ingredients.show', compact('addonIngredient'));
    }

    public function edit(AddonIngredient $addonIngredient)
    {
        $addons = Addon::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();
        return view('addon-ingredients.edit', compact('addonIngredient', 'addons', 'ingredients'));
    }

    public function update(Request $request, AddonIngredient $addonIngredient)
    {
        $data = $request->validate([
            'addon_id' => 'required|exists:addons,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $addonIngredient->update($data);

        return redirect()->route('addon-ingredients.index')->with('success', 'Addon ingredient updated successfully.');
    }

    public function destroy(AddonIngredient $addonIngredient)
    {
        $addonIngredient->delete();
        return redirect()->route('addon-ingredients.index')->with('success', 'Addon ingredient deleted successfully.');
    }
}
