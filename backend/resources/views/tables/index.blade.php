@extends('layouts.app')

@section('title', 'Tables')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Tables</h1>
        <a href="{{ route('tables.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Table</a>
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
                    <th class="px-4 py-3">Capacity</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Orders</th>
                    <th class="px-4 py-3">QR Code</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($tables as $table)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $table->id }}</td>
                        <td class="px-4 py-3 font-medium">{{ $table->name }}</td>
                        <td class="px-4 py-3">{{ $table->capacity }}</td>
                        <td class="px-4 py-3">
                            @php
                                $statusColors = ['available' => 'bg-green-100 text-green-800', 'occupied' => 'bg-red-100 text-red-800', 'reserved' => 'bg-yellow-100 text-yellow-800'];
                                $color = $statusColors[$table->status] ?? 'bg-gray-100 text-gray-800';
                            @endphp
                            <span class="inline-block text-xs px-2 py-1 rounded {{ $color }}">{{ ucfirst($table->status) }}</span>
                        </td>
                        <td class="px-4 py-3">{{ $table->orders_count }}</td>
                        <td class="px-4 py-3">
                            @if ($table->qr_code)
                                <a href="{{ $table->qr_code }}" target="_blank" class="text-blue-600 hover:underline text-sm">View QR</a>
                            @else
                                <span class="text-gray-400 text-xs">—</span>
                            @endif
                        </td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('tables.show', $table) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('tables.edit', $table) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('tables.destroy', $table) }}" method="POST" onsubmit="return confirm('Delete this table?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="px-4 py-6 text-center text-gray-500">No tables found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $tables->links() }}</div>
@endsection
