@extends('layouts.app')

@section('title', 'Transaction History')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Inventory Transactions</h1>
        <a href="{{ route('inventory.index') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">&larr; Back to Inventory</a>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-100 text-left">
                    <th class="px-4 py-3">ID</th>
                    <th class="px-4 py-3">Ingredient</th>
                    <th class="px-4 py-3">Type</th>
                    <th class="px-4 py-3">Quantity</th>
                    <th class="px-4 py-3">Note</th>
                    <th class="px-4 py-3">Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($transactions as $t)
                    @php
                        $typeColors = ['purchase' => 'bg-green-100 text-green-800', 'deduct' => 'bg-red-100 text-red-800', 'adjust' => 'bg-yellow-100 text-yellow-800'];
                        $typeColor = $typeColors[$t->type] ?? 'bg-gray-100 text-gray-800';
                    @endphp
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $t->id }}</td>
                        <td class="px-4 py-3 font-medium">{{ $t->ingredient->name ?? 'Deleted' }}</td>
                        <td class="px-4 py-3">
                            <span class="inline-block text-xs px-2 py-1 rounded {{ $typeColor }}">{{ ucfirst($t->type) }}</span>
                        </td>
                        <td class="px-4 py-3 {{ $t->quantity > 0 ? 'text-green-600' : 'text-red-600' }}">
                            {{ $t->quantity > 0 ? '+' : '' }}{{ number_format($t->quantity, 2) }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ $t->note ?? '-' }}</td>
                        <td class="px-4 py-3 text-sm">{{ $t->created_at->format('M d, Y H:i') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="px-4 py-6 text-center text-gray-500">No transactions found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $transactions->links() }}</div>
@endsection
