@extends('layouts.app')

@section('title', 'Products')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Products</h1>
        <a href="{{ route('products.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Product</a>
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
                    <th class="px-4 py-3">Image</th>
                    <th class="px-4 py-3">Category</th>
                    <th class="px-4 py-3">Sizes / Prices</th>
                    <th class="px-4 py-3">Addons</th>
                    <th class="px-4 py-3">Sugar</th>
                    <th class="px-4 py-3">Ice</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($products as $product)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $product->id }}</td>
                        <td class="px-4 py-3 font-medium">{{ $product->name }}</td>
                        <td class="px-4 py-3">
                            @if ($product->image)
                                <img src="{{ asset('storage/' . $product->image) }}" alt="{{ $product->name }}" class="w-10 h-10 rounded object-cover">
                            @else
                                <span class="text-gray-400 text-xs">—</span>
                            @endif
                        </td>
                        <td class="px-4 py-3">
                            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{{ $product->category->name }}</span>
                        </td>
                        <td class="px-4 py-3">
                            @foreach ($product->sizes as $size)
                                <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $size->name }} ${{ number_format($size->pivot->price, 2) }}</span>
                            @endforeach
                        </td>
                        <td class="px-4 py-3">
                            @foreach ($product->addons as $addon)
                                <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $addon->name }} (${{ number_format($addon->price, 2) }})</span>
                            @endforeach
                        </td>
                        <td class="px-4 py-3">
                            @foreach ($product->sugarLevels as $level)
                                <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $level->name }}</span>
                            @endforeach
                        </td>
                        <td class="px-4 py-3">
                            @foreach ($product->iceLevels as $level)
                                <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $level->name }}</span>
                            @endforeach
                        </td>
                        <td class="px-4 py-3">
                            @if ($product->status)
                                <span class="text-green-600 font-medium">Active</span>
                            @else
                                <span class="text-red-600 font-medium">Inactive</span>
                            @endif
                        </td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('products.show', $product) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('products.edit', $product) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('products.destroy', $product) }}" method="POST" onsubmit="return confirm('Delete this product?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="10" class="px-4 py-6 text-center text-gray-500">No products found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $products->links() }}</div>
@endsection
