<?php

namespace App\Http\Controllers\Ingredients;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function index()
    {
        $ingredients = Ingredient::orderBy('created_at', 'desc')->paginate(10);

        return view('ingredients.index', compact('ingredients'));
    }

    public function create()
    {
        return view('ingredients.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
        ]);

        Ingredient::create($data);

        return redirect()->route('ingredients.index')->with('success', 'Ingredient created successfully.');
    }

    public function show(Ingredient $ingredient)
    {
        return view('ingredients.show', compact('ingredient'));
    }

    public function edit(Ingredient $ingredient)
    {
        return view('ingredients.edit', compact('ingredient'));
    }

    public function update(Request $request, Ingredient $ingredient)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'unit' => 'required|string|max:20',
            'stock_quantity' => 'required|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
        ]);

        $ingredient->update($data);

        return redirect()->route('ingredients.index')->with('success', 'Ingredient updated successfully.');
    }

    public function destroy(Ingredient $ingredient)
    {
        $ingredient->delete();

        return redirect()->route('ingredients.index')->with('success', 'Ingredient deleted successfully.');
    }
}
