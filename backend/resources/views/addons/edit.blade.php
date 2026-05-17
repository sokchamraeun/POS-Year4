@extends('layouts.app')

@section('title', 'Edit Addon')

@section('content')
    <div class="mb-6">
        <a href="{{ route('addons.index') }}" class="text-blue-600 hover:underline">&larr; Back to Addons</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Edit Addon</h1>

        <form action="{{ route('addons.update', $addon) }}" method="POST">
            @csrf @method('PUT')

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name', $addon->name) }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="price" class="block font-medium mb-1">Price</label>
                <input type="number" name="price" id="price" value="{{ old('price', $addon->price) }}" step="0.01" min="0" class="w-full border rounded px-3 py-2 @error('price') border-red-500 @enderror" required>
                @error('price') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Update Addon</button>
        </form>
    </div>
@endsection
