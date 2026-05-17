@extends('layouts.app')

@section('title', 'Addons')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Addons</h1>
        <a href="{{ route('addons.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Addon</a>
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
                    <th class="px-4 py-3">Price</th>
                    <th class="px-4 py-3">Products</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($addons as $addon)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $addon->id }}</td>
                        <td class="px-4 py-3 font-medium">{{ $addon->name }}</td>
                        <td class="px-4 py-3">${{ number_format($addon->price, 2) }}</td>
                        <td class="px-4 py-3">{{ $addon->products_count }}</td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('addons.show', $addon) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('addons.edit', $addon) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('addons.destroy', $addon) }}" method="POST" onsubmit="return confirm('Delete this addon?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $addons->links() }}</div>
@endsection
