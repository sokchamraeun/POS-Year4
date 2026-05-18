@extends('layouts.app')

@section('title', $table->name)

@section('content')
    <div class="mb-6">
        <a href="{{ route('tables.index') }}" class="text-blue-600 hover:underline">&larr; Back to Tables</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold">{{ $table->name }}</h1>
                <p class="text-gray-500 text-sm">Capacity: {{ $table->capacity }} guests</p>
            </div>
            @php
                $statusColors = ['available' => 'bg-green-100 text-green-800', 'occupied' => 'bg-red-100 text-red-800', 'reserved' => 'bg-yellow-100 text-yellow-800'];
                $color = $statusColors[$table->status] ?? 'bg-gray-100 text-gray-800';
            @endphp
            <span class="inline-block text-sm px-3 py-1 rounded {{ $color }}">{{ ucfirst($table->status) }}</span>
        </div>

        <div class="mb-6">
            <h2 class="text-lg font-semibold mb-2">QR Code</h2>
            @if ($table->qr_code)
                <div class="flex items-center gap-4">
                    <img src="{{ $table->qr_code }}" alt="QR Code for {{ $table->name }}" class="w-32 h-32 border rounded">
                    <a href="{{ $table->qr_code }}" target="_blank" class="text-blue-600 hover:underline text-sm">Open QR</a>
                </div>
            @else
                <p class="text-gray-400 text-sm">No QR code generated.</p>
            @endif
        </div>

        <div class="border-t pt-4 flex gap-2">
            <a href="{{ route('tables.edit', $table) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('tables.destroy', $table) }}" method="POST" onsubmit="return confirm('Delete this table?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
