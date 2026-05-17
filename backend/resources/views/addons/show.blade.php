@extends('layouts.app')

@section('title', 'Addon Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('addons.index') }}" class="text-blue-600 hover:underline">&larr; Back to Addons</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">{{ $addon->name }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $addon->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Name</dt>
                <dd>{{ $addon->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Price</dt>
                <dd>${{ number_format($addon->price, 2) }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Products</dt>
                <dd>{{ $addon->products_count }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('addons.edit', $addon) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('addons.destroy', $addon) }}" method="POST" onsubmit="return confirm('Delete this addon?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
