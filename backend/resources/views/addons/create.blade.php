@extends('layouts.app')

@section('title', 'Create Addon')

@section('content')
    <div class="mb-6">
        <a href="{{ route('addons.index') }}" class="text-blue-600 hover:underline">&larr; Back to Addons</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New Addon</h1>

        <form action="{{ route('addons.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="price" class="block font-medium mb-1">Price</label>
                <input type="number" name="price" id="price" value="{{ old('price') }}" step="0.01" min="0" class="w-full border rounded px-3 py-2 @error('price') border-red-500 @enderror" required>
                @error('price') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Addon</button>
        </form>
    </div>
@endsection
