@extends('layouts.app')

@section('title', 'Inventory')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Inventory</h1>
        <div class="flex gap-2">
            <a href="{{ route('inventory.history') }}" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Transaction History</a>
            <a href="{{ route('inventory.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Adjust Stock</a>
        </div>
    </div>

    @if (session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    @if ($lowStock->isNotEmpty())
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>{{ $lowStock->count() }} ingredient(s)</strong> are below or at reorder level. Consider restocking soon.
        </div>
    @endif

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @forelse ($ingredients as $ingredient)
            @php
                $isLow = $ingredient->stock_quantity <= $ingredient->reorder_level;
                $isOut = $ingredient->stock_quantity <= 0;
            @endphp
            <div class="bg-white rounded shadow p-4 border-l-4 {{ $isOut ? 'border-red-500' : ($isLow ? 'border-yellow-400' : 'border-green-500') }}">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-lg">{{ $ingredient->name }}</h3>
                        <p class="text-sm text-gray-500">{{ $ingredient->unit }}</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded {{ $isOut ? 'bg-red-100 text-red-800' : ($isLow ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800') }}">
                        {{ $isOut ? 'Out of Stock' : ($isLow ? 'Low Stock' : 'In Stock') }}
                    </span>
                </div>

                <div class="mt-3 flex items-baseline gap-2">
                    <span class="text-2xl font-bold {{ $isOut ? 'text-red-600' : ($isLow ? 'text-yellow-600' : 'text-green-600') }}">
                        {{ number_format($ingredient->stock_quantity, 2) }}
                    </span>
                    <span class="text-sm text-gray-500">/ {{ number_format($ingredient->reorder_level, 2) }} reorder</span>
                </div>

                <div class="mt-1 text-xs text-gray-400">{{ $ingredient->inventory_transactions_count }} transaction(s)</div>

                <div class="mt-3 flex gap-2">
                    <a href="{{ route('inventory.create', ['ingredient_id' => $ingredient->id, 'type' => 'purchase']) }}" class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Purchase</a>
                    <a href="{{ route('inventory.create', ['ingredient_id' => $ingredient->id, 'type' => 'deduct']) }}" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Deduct</a>
                    <a href="{{ route('inventory.create', ['ingredient_id' => $ingredient->id, 'type' => 'adjust']) }}" class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">Adjust</a>
                </div>
            </div>
        @empty
            <div class="col-span-full bg-white rounded shadow p-6 text-center text-gray-500">No ingredients found.</div>
        @endforelse
    </div>
@endsection
