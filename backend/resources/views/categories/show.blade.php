@extends('layouts.app')

@section('title', 'Category Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('categories.index') }}" class="text-blue-600 hover:underline">&larr; Back to Categories</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">{{ $category->name }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $category->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Name</dt>
                <dd>{{ $category->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Products</dt>
                <dd>{{ $category->products_count }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('categories.edit', $category) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('categories.destroy', $category) }}" method="POST" onsubmit="return confirm('Delete this category?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
