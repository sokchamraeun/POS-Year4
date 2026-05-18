@extends('layouts.app')

@section('title', 'Ingredient Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('ingredients.index') }}" class="text-blue-600 hover:underline">&larr; Back to Ingredients</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">{{ $ingredient->name }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-36 font-medium text-gray-600">ID</dt>
                <dd>{{ $ingredient->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-36 font-medium text-gray-600">Name</dt>
                <dd>{{ $ingredient->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-36 font-medium text-gray-600">Unit</dt>
                <dd>{{ $ingredient->unit }}</dd>
            </div>
            <div class="flex">
                <dt class="w-36 font-medium text-gray-600">Stock Quantity</dt>
                <dd>{{ number_format($ingredient->stock_quantity, 2) }}</dd>
            </div>
            <div class="flex">
                <dt class="w-36 font-medium text-gray-600">Reorder Level</dt>
                <dd>{{ number_format($ingredient->reorder_level, 2) }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('ingredients.edit', $ingredient) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('ingredients.destroy', $ingredient) }}" method="POST" onsubmit="return confirm('Delete this ingredient?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
