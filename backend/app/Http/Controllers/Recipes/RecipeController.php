<?php

namespace App\Http\Controllers\Recipes;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Recipe;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class RecipeController extends Controller
{
    public function index()
    {
        $products = Product::with(['ingredients' => function ($q) {
            $q->orderBy('ingredients.name');
        }])->orderBy('name')->paginate(15);
        $sizes = Size::orderBy('name')->get()->keyBy('id');

        return view('recipes.index', compact('products', 'sizes'));
    }

    public function create(Request $request)
    {
        $products = Product::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();
        $sizes = Size::orderBy('name')->get();
        $selectedProductId = $request->query('product_id');
        $selectedSizeId = $request->query('size_id');

        return view('recipes.create', compact('products', 'ingredients', 'sizes', 'selectedProductId', 'selectedSizeId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size_id' => 'required|exists:sizes,id',
            'recipes' => 'required|array|min:1',
            'recipes.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipes.*.quantity' => 'required|numeric|min:0.01',
        ]);

        foreach ($data['recipes'] as $item) {
            Recipe::updateOrCreate(
                [
                    'product_id' => $data['product_id'],
                    'size_id' => $data['size_id'],
                    'ingredient_id' => $item['ingredient_id'],
                ],
                ['quantity' => $item['quantity']]
            );
        }

        return redirect()->route('recipes.index')->with('success', 'Recipe created successfully.');
    }

    public function show(Recipe $recipe)
    {
        $recipe->load(['product', 'size', 'ingredient']);

        return view('recipes.show', compact('recipe'));
    }

    public function batchEdit(Product $product, Size $size): View
    {
        $recipes = Recipe::where('product_id', $product->id)
            ->where('size_id', $size->id)
            ->with('ingredient')
            ->orderBy('ingredient_id')
            ->get();
        $ingredients = Ingredient::orderBy('name')->get();

        return view('recipes.batch-edit', compact('product', 'size', 'recipes', 'ingredients'));
    }

    public function batchUpdate(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size_id' => 'required|exists:sizes,id',
            'recipes' => 'required|array',
            'recipes.*.ingredient_id' => 'required|exists:ingredients,id',
            'recipes.*.quantity' => 'required|numeric|min:0.01',
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
                ]);
            }
        });

        return redirect()->route('recipes.index')->with('success', 'Recipe batch updated successfully.');
    }

    public function edit(Recipe $recipe)
    {
        $products = Product::orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();
        $sizes = Size::orderBy('name')->get();

        return view('recipes.edit', compact('recipe', 'products', 'ingredients', 'sizes'));
    }

    public function update(Request $request, Recipe $recipe)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'size_id' => 'required|exists:sizes,id',
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
