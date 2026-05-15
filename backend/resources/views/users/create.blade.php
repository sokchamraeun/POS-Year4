@extends('layouts.app')

@section('title', 'Create User')

@section('content')
    <div class="mb-6">
        <a href="{{ route('users.index') }}" class="text-blue-600 hover:underline">&larr; Back to Users</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New User</h1>

        <form action="{{ route('users.store') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="email" class="block font-medium mb-1">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" class="w-full border rounded px-3 py-2 @error('email') border-red-500 @enderror" required>
                @error('email') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="phone" class="block font-medium mb-1">Phone</label>
                <input type="text" name="phone" id="phone" value="{{ old('phone') }}" class="w-full border rounded px-3 py-2">
            </div>

            <div class="mb-4">
                <label for="password" class="block font-medium mb-1">Password</label>
                <input type="password" name="password" id="password" class="w-full border rounded px-3 py-2 @error('password') border-red-500 @enderror" required>
                @error('password') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="role_id" class="block font-medium mb-1">Role</label>
                <select name="role_id" id="role_id" class="w-full border rounded px-3 py-2">
                    <option value="">No Role</option>
                    @foreach ($roles as $role)
                        <option value="{{ $role->id }}" {{ old('role_id') == $role->id ? 'selected' : '' }}>{{ $role->name }}</option>
                    @endforeach
                </select>
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save User</button>
        </form>
    </div>
@endsection
