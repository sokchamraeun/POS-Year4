@extends('layouts.app')

@section('title', 'Ingredients')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Ingredients</h1>
        <a href="{{ route('ingredients.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Ingredient</a>
    </div>

    @if (session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    <div class="bg-white rounded shadow overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-100 text-left">
                    <th class="px-4 py-3">ID</th>
                    <th class="px-4 py-3">Name</th>
                    <th class="px-4 py-3">Unit</th>
                    <th class="px-4 py-3">Stock Quantity</th>
                    <th class="px-4 py-3">Reorder Level</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($ingredients as $ingredient)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $ingredient->id }}</td>
                        <td class="px-4 py-3 font-medium">{{ $ingredient->name }}</td>
                        <td class="px-4 py-3">{{ $ingredient->unit }}</td>
                        <td class="px-4 py-3">{{ number_format($ingredient->stock_quantity, 2) }}</td>
                        <td class="px-4 py-3">{{ number_format($ingredient->reorder_level, 2) }}</td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('ingredients.show', $ingredient) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('ingredients.edit', $ingredient) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('ingredients.destroy', $ingredient) }}" method="POST" onsubmit="return confirm('Delete this ingredient?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $ingredients->links() }}</div>
@endsection
