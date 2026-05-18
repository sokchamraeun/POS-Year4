@extends('layouts.app')

@section('title', "Order #{$order->id}")

@section('content')
    <div class="mb-6">
        <a href="{{ route('orders.index') }}" class="text-blue-600 hover:underline">&larr; Back to Orders</a>
    </div>

    <div class="bg-white rounded shadow p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
            <h1 class="text-2xl font-bold">Order #{{ $order->id }}</h1>
            <div class="flex gap-2">
                @php
                    $statusColors = ['pending' => 'bg-yellow-100 text-yellow-800', 'completed' => 'bg-green-100 text-green-800', 'cancelled' => 'bg-red-100 text-red-800'];
                    $statusColor = $statusColors[$order->status] ?? 'bg-gray-100 text-gray-800';
                    $payColors = ['paid' => 'bg-green-100 text-green-800', 'unpaid' => 'bg-red-100 text-red-800', 'partial' => 'bg-yellow-100 text-yellow-800'];
                    $payColor = $payColors[$order->payment_status] ?? 'bg-gray-100 text-gray-800';
                @endphp
                <span class="inline-block text-xs px-3 py-1 rounded {{ $statusColor }}">{{ ucfirst($order->status ?? 'pending') }}</span>
                <span class="inline-block text-xs px-3 py-1 rounded {{ $payColor }}">{{ ucfirst($order->payment_status ?? 'unknown') }}</span>
            </div>
        </div>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Customer</dt>
                <dd>{{ $order->customer->name ?? 'Walk-in' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Table</dt>
                <dd>{{ $order->table->name ?? '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Payment Method</dt>
                <dd>{{ ucfirst($order->payment_method ?? '-') }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Total</dt>
                <dd class="font-bold text-lg">${{ number_format($order->total, 2) }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Date</dt>
                <dd>{{ $order->created_at->format('M d, Y H:i') }}</dd>
            </div>
        </dl>
    </div>

    <div class="bg-white rounded shadow overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-100 text-left">
                    <th class="px-4 py-3">Product</th>
                    <th class="px-4 py-3">Size</th>
                    <th class="px-4 py-3">Sugar</th>
                    <th class="px-4 py-3">Ice</th>
                    <th class="px-4 py-3">Addons</th>
                    <th class="px-4 py-3">Qty</th>
                    <th class="px-4 py-3">Unit Price</th>
                    <th class="px-4 py-3">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($order->items as $item)
                    <tr class="border-t">
                        <td class="px-4 py-3 font-medium">{{ $item->product->name }}</td>
                        <td class="px-4 py-3">{{ $item->size->name ?? '-' }}</td>
                        <td class="px-4 py-3">{{ $item->sugarLevel->name ?? '-' }}</td>
                        <td class="px-4 py-3">{{ $item->iceLevel->name ?? '-' }}</td>
                        <td class="px-4 py-3">
                            @forelse ($item->addons as $itemAddon)
                                <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $itemAddon->addon->name }} (${{ number_format($itemAddon->price, 2) }})</span>
                            @empty
                                <span class="text-gray-400 text-xs">—</span>
                            @endforelse
                        </td>
                        <td class="px-4 py-3">{{ $item->qty }}</td>
                        <td class="px-4 py-3">${{ number_format($item->unit_price, 2) }}</td>
                        <td class="px-4 py-3">${{ number_format($item->subtotal, 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" class="px-4 py-6 text-center text-gray-500">No items in this order.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
