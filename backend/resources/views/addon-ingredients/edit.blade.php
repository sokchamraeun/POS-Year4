@extends('layouts.app')

@section('title', 'Edit Addon Ingredient')

@section('content')
    <div class="mb-6">
        <a href="{{ route('addon-ingredients.index') }}" class="text-blue-600 hover:underline">&larr; Back to Addon Ingredients</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Edit Addon Ingredient</h1>

        <form action="{{ route('addon-ingredients.update', $addonIngredient) }}" method="POST">
            @csrf @method('PUT')

            <div class="mb-4">
                <label for="addon_id" class="block font-medium mb-1">Addon</label>
                <select name="addon_id" id="addon_id" class="w-full border rounded px-3 py-2 @error('addon_id') border-red-500 @enderror" required>
                    <option value="">Select addon</option>
                    @foreach ($addons as $addon)
                        <option value="{{ $addon->id }}" @selected(old('addon_id', $addonIngredient->addon_id) == $addon->id)>{{ $addon->name }} (${{ number_format($addon->price, 2) }})</option>
                    @endforeach
                </select>
                @error('addon_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="ingredient_id" class="block font-medium mb-1">Ingredient</label>
                <select name="ingredient_id" id="ingredient_id" class="w-full border rounded px-3 py-2 @error('ingredient_id') border-red-500 @enderror" required>
                    <option value="">Select ingredient</option>
                    @foreach ($ingredients as $ingredient)
                        <option value="{{ $ingredient->id }}" @selected(old('ingredient_id', $addonIngredient->ingredient_id) == $ingredient->id)>{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                    @endforeach
                </select>
                @error('ingredient_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="quantity" class="block font-medium mb-1">Quantity</label>
                <input type="number" name="quantity" id="quantity" value="{{ old('quantity', $addonIngredient->quantity) }}" step="0.01" min="0.01" class="w-full border rounded px-3 py-2 @error('quantity') border-red-500 @enderror" required>
                @error('quantity') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Update</button>
        </form>
    </div>
@endsection
