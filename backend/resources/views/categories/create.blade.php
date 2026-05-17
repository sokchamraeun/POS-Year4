@extends('layouts.app')

@section('title', 'Create Category')

@section('content')
    <div class="mb-6">
        <a href="{{ route('categories.index') }}" class="text-blue-600 hover:underline">&larr; Back to Categories</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New Category</h1>

        <form action="{{ route('categories.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Category</button>
        </form>
    </div>
@endsection
