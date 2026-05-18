@extends('layouts.app')

@section('title', 'Edit Ingredient')

@section('content')
    <div class="mb-6">
        <a href="{{ route('ingredients.index') }}" class="text-blue-600 hover:underline">&larr; Back to Ingredients</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Edit Ingredient</h1>

        <form action="{{ route('ingredients.update', $ingredient) }}" method="POST">
            @csrf @method('PUT')

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name', $ingredient->name) }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="unit" class="block font-medium mb-1">Unit</label>
                <select name="unit" id="unit" class="w-full border rounded px-3 py-2 @error('unit') border-red-500 @enderror" required>
                    <option value="">Select unit</option>
                    <option value="gram" @selected(old('unit', $ingredient->unit) == 'gram')>Gram (g)</option>
                    <option value="ml" @selected(old('unit', $ingredient->unit) == 'ml')>Milliliter (ml)</option>
                    <option value="pcs" @selected(old('unit', $ingredient->unit) == 'pcs')>Pieces (pcs)</option>
                </select>
                @error('unit') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="stock_quantity" class="block font-medium mb-1">Stock Quantity</label>
                <input type="number" name="stock_quantity" id="stock_quantity" value="{{ old('stock_quantity', $ingredient->stock_quantity) }}" step="0.01" min="0" class="w-full border rounded px-3 py-2 @error('stock_quantity') border-red-500 @enderror" required>
                @error('stock_quantity') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="reorder_level" class="block font-medium mb-1">Reorder Level</label>
                <input type="number" name="reorder_level" id="reorder_level" value="{{ old('reorder_level', $ingredient->reorder_level) }}" step="0.01" min="0" class="w-full border rounded px-3 py-2 @error('reorder_level') border-red-500 @enderror" required>
                @error('reorder_level') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Update Ingredient</button>
        </form>
    </div>
@endsection
