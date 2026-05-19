@extends('layouts.app')

@section('title', 'Addon Ingredients')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Addon Ingredients</h1>
        <a href="{{ route('addon-ingredients.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Ingredient</a>
    </div>

    @if (session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    @forelse ($addons as $addon)
        <div class="bg-white rounded shadow overflow-x-auto mb-6">
            <div class="px-4 py-3 bg-gray-50 border-b font-semibold text-lg flex justify-between items-center">
                <span>{{ $addon->name }} (${{ number_format($addon->price, 2) }})</span>
                <a href="{{ route('addon-ingredients.create', ['addon_id' => $addon->id]) }}" class="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ Add Ingredient</a>
            </div>
            @if ($addon->ingredients->isNotEmpty())
                <table class="w-full">
                    <thead>
                        <tr class="bg-gray-100 text-left text-sm">
                            <th class="px-4 py-2">Ingredient</th>
                            <th class="px-4 py-2">Quantity</th>
                            <th class="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($addon->ingredients as $ingredient)
                            <tr class="border-t">
                                <td class="px-4 py-2">{{ $ingredient->name }}</td>
                                <td class="px-4 py-2">{{ number_format($ingredient->pivot->quantity, 2) }} {{ $ingredient->unit }}</td>
                                <td class="px-4 py-2 flex gap-2">
                                    <a href="{{ route('addon-ingredients.edit', $ingredient->pivot->id) }}" class="text-yellow-600 hover:underline text-sm">Edit</a>
                                    <form action="{{ route('addon-ingredients.destroy', $ingredient->pivot->id) }}" method="POST" onsubmit="return confirm('Remove this ingredient from addon?')">
                                        @csrf @method('DELETE')
                                        <button class="text-red-600 hover:underline text-sm">Remove</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="px-4 py-6 text-center text-gray-500">No ingredients assigned to this addon.</div>
            @endif
        </div>
    @empty
        <div class="bg-white rounded shadow p-6 text-center text-gray-500">No addons found.</div>
    @endforelse

    <div class="mt-4">{{ $addons->links() }}</div>
@endsection
