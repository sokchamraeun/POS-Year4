@extends('layouts.app')

@section('title', $product->name)

@section('content')
    <div class="mb-6">
        <a href="{{ route('products.index') }}" class="text-blue-600 hover:underline">&larr; Back to Products</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <div class="flex items-center gap-4 mb-4">
            @if ($product->image)
                <img src="{{ asset('storage/' . $product->image) }}" alt="{{ $product->name }}" class="w-24 h-24 rounded object-cover">
            @endif
            <h1 class="text-2xl font-bold">{{ $product->name }}</h1>
        </div>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $product->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Category</dt>
                <dd>
                    <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{{ $product->category->name }}</span>
                </dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Description</dt>
                <dd>{{ $product->description ?? '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Status</dt>
                <dd>
                    @if ($product->status)
                        <span class="text-green-600 font-medium">Active</span>
                    @else
                        <span class="text-red-600 font-medium">Inactive</span>
                    @endif
                </dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Sugar Levels</dt>
                <dd>
                    @forelse ($product->sugarLevels as $level)
                        <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $level->name }}</span>
                    @empty
                        <span>-</span>
                    @endforelse
                </dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Ice Levels</dt>
                <dd>
                    @forelse ($product->iceLevels as $level)
                        <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $level->name }}</span>
                    @empty
                        <span>-</span>
                    @endforelse
                </dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Sizes</dt>
                <dd>
                    @foreach ($product->sizes as $size)
                        <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $size->name }} — ${{ number_format($size->pivot->price, 2) }}</span>
                    @endforeach
                </dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Addons</dt>
                <dd>
                    @foreach ($product->addons as $addon)
                        <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $addon->name }}</span>
                    @endforeach
                </dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('products.edit', $product) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('products.destroy', $product) }}" method="POST" onsubmit="return confirm('Delete this product?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
