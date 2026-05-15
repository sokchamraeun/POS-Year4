@extends('layouts.app')

@section('title', 'Edit Role')

@section('content')
    <div class="mb-6">
        <a href="{{ route('roles.index') }}" class="text-blue-600 hover:underline">&larr; Back to Roles</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Edit Role</h1>

        <form action="{{ route('roles.update', $role) }}" method="POST">
            @csrf @method('PUT')

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name', $role->name) }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="slug" class="block font-medium mb-1">Slug</label>
                <input type="text" name="slug" id="slug" value="{{ old('slug', $role->slug) }}" class="w-full border rounded px-3 py-2 @error('slug') border-red-500 @enderror" required>
                @error('slug') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="description" class="block font-medium mb-1">Description</label>
                <textarea name="description" id="description" rows="3" class="w-full border rounded px-3 py-2">{{ old('description', $role->description) }}</textarea>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-2">Permissions</label>
                <div class="grid grid-cols-2 gap-2">
                    @foreach ($permissions as $perm)
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="permissions[]" value="{{ $perm->id }}" {{ $role->permissions->contains($perm->id) ? 'checked' : '' }}>
                            <span>{{ $perm->name }}</span>
                        </label>
                    @endforeach
                </div>
            </div>

            <button type="submit" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Update Role</button>
        </form>
    </div>
@endsection
