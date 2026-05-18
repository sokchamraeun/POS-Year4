@extends('layouts.app')

@section('title', 'Adjust Stock')

@section('content')
    <div class="mb-6">
        <a href="{{ route('inventory.index') }}" class="text-blue-600 hover:underline">&larr; Back to Inventory</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Adjust Stock</h1>

        <form action="{{ route('inventory.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="ingredient_id" class="block font-medium mb-1">Ingredient</label>
                <select name="ingredient_id" id="ingredient_id" class="w-full border rounded px-3 py-2 @error('ingredient_id') border-red-500 @enderror" required>
                    <option value="">Select ingredient</option>
                    @foreach ($ingredients as $ingredient)
                        <option value="{{ $ingredient->id }}" @selected(old('ingredient_id', $selectedIngredientId) == $ingredient->id)>
                            {{ $ingredient->name }} (stock: {{ number_format($ingredient->stock_quantity, 2) }} {{ $ingredient->unit }})
                        </option>
                    @endforeach
                </select>
                @error('ingredient_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="type" class="block font-medium mb-1">Type</label>
                <select name="type" id="type" class="w-full border rounded px-3 py-2 @error('type') border-red-500 @enderror" required>
                    <option value="">Select type</option>
                    <option value="purchase" @selected(old('type', request('type')) == 'purchase')>Purchase (add stock)</option>
                    <option value="deduct" @selected(old('type', request('type')) == 'deduct')>Deduct (remove stock)</option>
                    <option value="adjust" @selected(old('type', request('type')) == 'adjust')>Adjust (set exact quantity)</option>
                </select>
                @error('type') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="quantity" class="block font-medium mb-1">Quantity</label>
                <input type="number" name="quantity" id="quantity" value="{{ old('quantity') }}" step="0.01" min="0.01" class="w-full border rounded px-3 py-2 @error('quantity') border-red-500 @enderror" required>
                @error('quantity') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="note" class="block font-medium mb-1">Note (optional)</label>
                <textarea name="note" id="note" rows="2" class="w-full border rounded px-3 py-2 @error('note') border-red-500 @enderror">{{ old('note') }}</textarea>
                @error('note') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Transaction</button>
        </form>
    </div>
@endsection
