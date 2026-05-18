@extends('layouts.app')

@section('title', 'Create Table')

@section('content')
    <div class="mb-6">
        <a href="{{ route('tables.index') }}" class="text-blue-600 hover:underline">&larr; Back to Tables</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-lg">
        <h1 class="text-2xl font-bold mb-6">Create Table</h1>

        <form action="{{ route('tables.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" value="{{ old('name') }}" required class="w-full border border-gray-300 rounded px-3 py-2">
                @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" name="capacity" value="{{ old('capacity', 4) }}" min="1" required class="w-full border border-gray-300 rounded px-3 py-2">
                @error('capacity') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" class="w-full border border-gray-300 rounded px-3 py-2">
                    <option value="available" {{ old('status') === 'available' ? 'selected' : '' }}>Available</option>
                    <option value="occupied" {{ old('status') === 'occupied' ? 'selected' : '' }}>Occupied</option>
                    <option value="reserved" {{ old('status') === 'reserved' ? 'selected' : '' }}>Reserved</option>
                </select>
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Table</button>
        </form>
    </div>
@endsection
