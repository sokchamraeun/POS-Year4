@extends('layouts.app')

@section('title', 'Create Recipe')

@section('content')
    <div class="mb-6">
        <a href="{{ route('recipes.index') }}" class="text-blue-600 hover:underline">&larr; Back to Recipes</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New Recipe</h1>

        <form action="{{ route('recipes.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="product_id" class="block font-medium mb-1">Product</label>
                <select name="product_id" id="product_id" class="w-full border rounded px-3 py-2 @error('product_id') border-red-500 @enderror" required>
                    <option value="">Select product</option>
                    @foreach ($products as $product)
                        <option value="{{ $product->id }}" @selected(old('product_id', $selectedProductId) == $product->id)>{{ $product->name }}</option>
                    @endforeach
                </select>
                @error('product_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="ingredient_id" class="block font-medium mb-1">Ingredient</label>
                <select name="ingredient_id" id="ingredient_id" class="w-full border rounded px-3 py-2 @error('ingredient_id') border-red-500 @enderror" required>
                    <option value="">Select ingredient</option>
                    @foreach ($ingredients as $ingredient)
                        <option value="{{ $ingredient->id }}" @selected(old('ingredient_id') == $ingredient->id)>{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                    @endforeach
                </select>
                @error('ingredient_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="quantity" class="block font-medium mb-1">Quantity</label>
                <input type="number" name="quantity" id="quantity" value="{{ old('quantity') }}" step="0.01" min="0.01" class="w-full border rounded px-3 py-2 @error('quantity') border-red-500 @enderror" required>
                @error('quantity') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Recipe</button>
        </form>
    </div>
@endsection
