@extends('layouts.app')

@section('title', 'Recipe Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('recipes.index') }}" class="text-blue-600 hover:underline">&larr; Back to Recipes</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Recipe #{{ $recipe->id }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $recipe->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Product</dt>
                <dd>{{ $recipe->product->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Ingredient</dt>
                <dd>{{ $recipe->ingredient->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Quantity</dt>
                <dd>{{ number_format($recipe->quantity, 2) }} {{ $recipe->ingredient->unit }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('recipes.edit', $recipe) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('recipes.destroy', $recipe) }}" method="POST" onsubmit="return confirm('Delete this recipe?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
