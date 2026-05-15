@extends('layouts.app')

@section('title', 'Create Permission')

@section('content')
    <div class="mb-6">
        <a href="{{ route('permissions.index') }}" class="text-blue-600 hover:underline">&larr; Back to Permissions</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New Permission</h1>

        <form action="{{ route('permissions.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="slug" class="block font-medium mb-1">Slug</label>
                <input type="text" name="slug" id="slug" value="{{ old('slug') }}" class="w-full border rounded px-3 py-2 @error('slug') border-red-500 @enderror" required>
                @error('slug') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="module" class="block font-medium mb-1">Module</label>
                <input type="text" name="module" id="module" value="{{ old('module') }}" class="w-full border rounded px-3 py-2">
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Permission</button>
        </form>
    </div>
@endsection
