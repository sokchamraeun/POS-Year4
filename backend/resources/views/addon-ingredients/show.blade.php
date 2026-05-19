@extends('layouts.app')

@section('title', 'Addon Ingredient Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('addon-ingredients.index') }}" class="text-blue-600 hover:underline">&larr; Back to Addon Ingredients</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Addon Ingredient #{{ $addonIngredient->id }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $addonIngredient->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Addon</dt>
                <dd>{{ $addonIngredient->addon->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Ingredient</dt>
                <dd>{{ $addonIngredient->ingredient->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Quantity</dt>
                <dd>{{ number_format($addonIngredient->quantity, 2) }} {{ $addonIngredient->ingredient->unit }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('addon-ingredients.edit', $addonIngredient) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('addon-ingredients.destroy', $addonIngredient) }}" method="POST" onsubmit="return confirm('Delete this addon ingredient?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
