@extends('layouts.app')

@section('title', 'Create Recipe')

@section('content')
    <div class="mb-6">
        <a href="{{ route('recipes.index') }}" class="text-blue-600 hover:underline">&larr; Back to Recipes</a>
    </div>

    <div class="bg-white rounded shadow p-6">
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
                <label for="size_id" class="block font-medium mb-1">Size</label>
                <select name="size_id" id="size_id" class="w-full border rounded px-3 py-2 @error('size_id') border-red-500 @enderror" required>
                    <option value="">Select size</option>
                    @foreach ($sizes as $size)
                        <option value="{{ $size->id }}" @selected(old('size_id', $selectedSizeId) == $size->id)>{{ $size->name }}</option>
                    @endforeach
                </select>
                @error('size_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <table class="w-full mb-4">
                <thead>
                    <tr class="text-left text-xs text-gray-500 border-b">
                        <th class="px-2 py-2">Ingredient</th>
                        <th class="px-2 py-2">Quantity</th>
                        <th class="px-2 py-2 w-16">Remove</th>
                    </tr>
                </thead>
                <tbody id="recipe-rows">
                    <tr class="border-b recipe-row">
                        <td class="px-2 py-2">
                            <select name="recipes[0][ingredient_id]" class="w-full border rounded px-2 py-1 text-sm" required>
                                <option value="">Select ingredient</option>
                                @foreach ($ingredients as $ingredient)
                                    <option value="{{ $ingredient->id }}" @selected(old('recipes.0.ingredient_id') == $ingredient->id)>{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                                @endforeach
                            </select>
                        </td>
                        <td class="px-2 py-2">
                            <input type="number" name="recipes[0][quantity]" value="{{ old('recipes.0.quantity', 1) }}" step="0.01" min="0.01" class="w-full border rounded px-2 py-1 text-sm" required>
                        </td>
                        <td class="px-2 py-2 text-center">
                            <input type="checkbox" class="remove-checkbox">
                        </td>
                    </tr>
                </tbody>
            </table>

            <button type="button" id="add-row" class="text-blue-600 hover:underline text-sm mb-4">+ Add Ingredient</button>

            <div class="flex gap-2">
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Recipe</button>
                <a href="{{ route('recipes.index') }}" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</a>
            </div>
        </form>
    </div>

    <script>
        let rowIndex = 1;

        document.getElementById('add-row').addEventListener('click', function () {
            const tbody = document.getElementById('recipe-rows');
            const tr = document.createElement('tr');
            tr.className = 'border-b recipe-row';
            tr.innerHTML = `
                <td class="px-2 py-2">
                    <select name="recipes[${rowIndex}][ingredient_id]" class="w-full border rounded px-2 py-1 text-sm" required>
                        <option value="">Select ingredient</option>
                        @foreach ($ingredients as $ingredient)
                            <option value="{{ $ingredient->id }}">{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                        @endforeach
                    </select>
                </td>
                <td class="px-2 py-2">
                    <input type="number" name="recipes[${rowIndex}][quantity]" value="1" step="0.01" min="0.01" class="w-full border rounded px-2 py-1 text-sm" required>
                </td>
                <td class="px-2 py-2 text-center">
                    <input type="checkbox" class="remove-checkbox">
                </td>
            `;
            tbody.appendChild(tr);
            rowIndex++;
        });

        document.getElementById('recipe-rows').addEventListener('change', function (e) {
            if (e.target.classList.contains('remove-checkbox')) {
                const row = e.target.closest('.recipe-row');
                if (e.target.checked) {
                    row.style.display = 'none';
                    row.querySelectorAll('input, select').forEach(el => el.disabled = true);
                } else {
                    row.style.display = '';
                    row.querySelectorAll('input, select').forEach(el => el.disabled = false);
                }
            }
        });
    </script>
@endsection