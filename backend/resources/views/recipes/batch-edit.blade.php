@extends('layouts.app')

@section('title', 'Batch Edit Recipe')

@section('content')
    <div class="mb-6">
        <a href="{{ route('recipes.index') }}" class="text-blue-600 hover:underline">&larr; Back to Recipes</a>
    </div>

    <div class="bg-white rounded shadow p-6">
        <h1 class="text-2xl font-bold mb-1">Batch Edit Recipe</h1>
        <p class="text-gray-500 mb-6">{{ $product->name }} &mdash; {{ $size->name }}</p>

        <form action="{{ route('recipes.batch-update') }}" method="POST">
            @csrf @method('PUT')

            <input type="hidden" name="product_id" value="{{ $product->id }}">
            <input type="hidden" name="size_id" value="{{ $size->id }}">

            <table class="w-full mb-4">
                <thead>
                    <tr class="text-left text-xs text-gray-500 border-b">
                        <th class="px-2 py-2">Ingredient</th>
                        <th class="px-2 py-2">Quantity</th>
                        <th class="px-2 py-2 w-16">Remove</th>
                    </tr>
                </thead>
                <tbody id="recipe-rows">
                    @forelse ($recipes as $recipe)
                        <tr class="border-b recipe-row">
                            <td class="px-2 py-2">
                                <select name="recipes[{{ $loop->index }}][ingredient_id]" class="w-full border rounded px-2 py-1 text-sm" required>
                                    <option value="">Select ingredient</option>
                                    @foreach ($ingredients as $ingredient)
                                        <option value="{{ $ingredient->id }}" @selected($recipe->ingredient_id == $ingredient->id)>{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                                    @endforeach
                                </select>
                            </td>
                            <td class="px-2 py-2">
                                <input type="number" name="recipes[{{ $loop->index }}][quantity]" value="{{ $recipe->quantity }}" step="0.01" min="0.01" class="w-full border rounded px-2 py-1 text-sm" required>
                            </td>
                            <td class="px-2 py-2 text-center">
                                <input type="checkbox" class="remove-checkbox">
                            </td>
                        </tr>
                    @empty
                        <tr class="border-b recipe-row">
                            <td class="px-2 py-2">
                                <select name="recipes[0][ingredient_id]" class="w-full border rounded px-2 py-1 text-sm" required>
                                    <option value="">Select ingredient</option>
                                    @foreach ($ingredients as $ingredient)
                                        <option value="{{ $ingredient->id }}">{{ $ingredient->name }} ({{ $ingredient->unit }})</option>
                                    @endforeach
                                </select>
                            </td>
                            <td class="px-2 py-2">
                                <input type="number" name="recipes[0][quantity]" value="1" step="0.01" min="0.01" class="w-full border rounded px-2 py-1 text-sm" required>
                            </td>
                            <td class="px-2 py-2 text-center">
                                <input type="checkbox" class="remove-checkbox">
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>

            <button type="button" id="add-row" class="text-blue-600 hover:underline text-sm mb-4">+ Add Ingredient</button>

            <div class="flex gap-2">
                <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Save Changes</button>
                <a href="{{ route('recipes.index') }}" class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</a>
            </div>
        </form>
    </div>

    <script>
        let rowIndex = {{ max($recipes->count(), 1) }};

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