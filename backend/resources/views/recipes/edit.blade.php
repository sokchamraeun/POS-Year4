@extends('layouts.app')

@section('title', 'Edit Recipe')

@section('content')
    <div class="mb-6">
        <a href="{{ route('recipes.index') }}" class="text-blue-600 hover:underline">&larr; Back to Recipes</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Edit Recipe</h1>

        <form action="{{ route('recipes.update', $recipe) }}" method="POST">
            @csrf @method('PUT')

            <div class="mb-4">
                <label for="product_id" class="block font-medium mb-1">Product</label>
                <select name="product_id" id="product_id" class="w-full border rounded px-3 py-2 @error('product_id') border-red-500 @enderror" required>
                    <option value="">Select product</option>
                    @foreach ($products as $product)
                        <option value="{{ $product->id }}" @selected(old('product_id', $recipe->product_id) == $product->id)>{{ $product->name }}</option>
                    @endforeach
                </select>
                @error('product_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="size_id" class="block font-medium mb-1">Size</label>
                <select name="size_id" id="size_id" class="w-full border rounded px-3 py-2 @error('size_id') border-red-500 @enderror" required>
                    <option value="">Select size</option>
                    @foreach ($sizes as $size)
                        <option value="{{ $size->id }}" @selected(old('size_id', $recipe->size_id) == $size->id)>{{ $size->name }}</option>
                    @endforeach
                </select>
                @error('size_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="ingredient_id" class="block font-medium mb-1">Ingredient</label>
                <select name="ingredient_id" id="ingredient_id" class="w-full border rounded px-3 py-2 @error('ingredient_id') border-red-500 @enderror" required>
                    <option value="">Select ingredient</option>
                    @foreach ($ingredients as $ingredient)
                        <option value="{{ $ingredient->id }}" @selected(old('ingredient_id', $recipe->ingredient_id) == $ingredient->id)>{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                    @endforeach
                </select>
                @error('ingredient_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="quantity" class="block font-medium mb-1">Quantity</label>
                <input type="number" name="quantity" id="quantity" value="{{ old('quantity', $recipe->quantity) }}" step="0.01" min="0.01" class="w-full border rounded px-3 py-2 @error('quantity') border-red-500 @enderror" required>
                @error('quantity') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Update Recipe</button>
        </form>
    </div>
@endsection
