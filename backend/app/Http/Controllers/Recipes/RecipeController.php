<?php

namespace App\Http\Controllers\Recipes;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Ingredient;
use App\Models\Recipe;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index()
    {
        $products = Product::with(['ingredients' => function ($q) {
            $q->orderBy('ingredients.name');
        }])->orderBy('name')->paginate(15);
        return view('recipes.index', compact('products'));
    }

    public function create(Request $request)
    {
        $products = Product::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();
        $selectedProductId = $request->query('product_id');
        return view('recipes.create', compact('products', 'ingredients', 'selectedProductId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        Recipe::create($data);

        return redirect()->route('recipes.index')->with('success', 'Recipe created successfully.');
    }

    public function show(Recipe $recipe)
    {
        $recipe->load(['product', 'ingredient']);
        return view('recipes.show', compact('recipe'));
    }

    public function edit(Recipe $recipe)
    {
        $products = Product::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();
        return view('recipes.edit', compact('recipe', 'products', 'ingredients'));
    }

    public function update(Request $request, Recipe $recipe)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $recipe->update($data);

        return redirect()->route('recipes.index')->with('success', 'Recipe updated successfully.');
    }

    public function destroy(Recipe $recipe)
    {
        $recipe->delete();
        return redirect()->route('recipes.index')->with('success', 'Recipe deleted successfully.');
    }
}
