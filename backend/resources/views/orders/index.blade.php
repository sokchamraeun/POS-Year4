@extends('layouts.app')

@section('title', 'Orders')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Orders</h1>
    </div>

    @if (session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    <div class="bg-white rounded shadow overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-100 text-left">
                    <th class="px-4 py-3">Order #</th>
                    <th class="px-4 py-3">Customer</th>
                    <th class="px-4 py-3">Table</th>
                    <th class="px-4 py-3">Items</th>
                    <th class="px-4 py-3">Total</th>
                    <th class="px-4 py-3">Payment</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Date</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($orders as $order)
                    <tr class="border-t">
                        <td class="px-4 py-3 font-medium">#{{ $order->id }}</td>
                        <td class="px-4 py-3">{{ $order->customer->name ?? 'Walk-in' }}</td>
                        <td class="px-4 py-3">{{ $order->table->name ?? '-' }}</td>
                        <td class="px-4 py-3">{{ $order->items->count() }}</td>
                        <td class="px-4 py-3">${{ number_format($order->total, 2) }}</td>
                        <td class="px-4 py-3">
                            @php
                                $payColors = ['paid' => 'bg-green-100 text-green-800', 'unpaid' => 'bg-red-100 text-red-800', 'partial' => 'bg-yellow-100 text-yellow-800'];
                                $payColor = $payColors[$order->payment_status] ?? 'bg-gray-100 text-gray-800';
                            @endphp
                            <span class="inline-block text-xs px-2 py-1 rounded {{ $payColor }}">{{ ucfirst($order->payment_status ?? 'unknown') }}</span>
                        </td>
                        <td class="px-4 py-3">
                            @php
                                $statusColors = ['pending' => 'bg-yellow-100 text-yellow-800', 'completed' => 'bg-green-100 text-green-800', 'cancelled' => 'bg-red-100 text-red-800'];
                                $statusColor = $statusColors[$order->status] ?? 'bg-gray-100 text-gray-800';
                            @endphp
                            <span class="inline-block text-xs px-2 py-1 rounded {{ $statusColor }}">{{ ucfirst($order->status ?? 'pending') }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm">{{ $order->created_at->format('M d, H:i') }}</td>
                        <td class="px-4 py-3">
                            <a href="{{ route('orders.show', $order) }}" class="text-blue-600 hover:underline">View</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="9" class="px-4 py-6 text-center text-gray-500">No orders found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $orders->links() }}</div>
@endsection
