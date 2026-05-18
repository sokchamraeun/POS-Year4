@extends('layouts.app')

@section('title', 'Create Ingredient')

@section('content')
    <div class="mb-6">
        <a href="{{ route('ingredients.index') }}" class="text-blue-600 hover:underline">&larr; Back to Ingredients</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New Ingredient</h1>

        <form action="{{ route('ingredients.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="unit" class="block font-medium mb-1">Unit</label>
                <select name="unit" id="unit" class="w-full border rounded px-3 py-2 @error('unit') border-red-500 @enderror" required>
                    <option value="">Select unit</option>
                    <option value="gram" @selected(old('unit') == 'gram')>Gram (g)</option>
                    <option value="ml" @selected(old('unit') == 'ml')>Milliliter (ml)</option>
                    <option value="pcs" @selected(old('unit') == 'pcs')>Pieces (pcs)</option>
                </select>
                @error('unit') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="stock_quantity" class="block font-medium mb-1">Stock Quantity</label>
                <input type="number" name="stock_quantity" id="stock_quantity" value="{{ old('stock_quantity', 0) }}" step="0.01" min="0" class="w-full border rounded px-3 py-2 @error('stock_quantity') border-red-500 @enderror" required>
                @error('stock_quantity') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="reorder_level" class="block font-medium mb-1">Reorder Level</label>
                <input type="number" name="reorder_level" id="reorder_level" value="{{ old('reorder_level', 0) }}" step="0.01" min="0" class="w-full border rounded px-3 py-2 @error('reorder_level') border-red-500 @enderror" required>
                @error('reorder_level') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Ingredient</button>
        </form>
    </div>
@endsection
