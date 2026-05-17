@extends('layouts.app')

@section('title', 'Categories')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Categories</h1>
        <a href="{{ route('categories.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Category</a>
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
                    <th class="px-4 py-3">Products</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($categories as $category)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $category->id }}</td>
                        <td class="px-4 py-3 font-medium">{{ $category->name }}</td>
                        <td class="px-4 py-3">{{ $category->products_count }}</td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('categories.show', $category) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('categories.edit', $category) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('categories.destroy', $category) }}" method="POST" onsubmit="return confirm('Delete this category?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $categories->links() }}</div>
@endsection
