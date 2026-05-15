@extends('layouts.app')

@section('title', 'User Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('users.index') }}" class="text-blue-600 hover:underline">&larr; Back to Users</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">{{ $user->name }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $user->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Email</dt>
                <dd>{{ $user->email }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Phone</dt>
                <dd>{{ $user->phone ?? '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Role</dt>
                <dd>{{ $user->role?->name ?? '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Status</dt>
                <dd>{{ $user->status ? 'Active' : 'Inactive' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Verified</dt>
                <dd>{{ $user->email_verified_at ? $user->email_verified_at->format('M d, Y H:i') : 'No' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Last Login</dt>
                <dd>{{ $user->last_login_at ? $user->last_login_at->format('M d, Y H:i') : '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Created</dt>
                <dd>{{ $user->created_at->format('M d, Y H:i') }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('users.edit', $user) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('users.destroy', $user) }}" method="POST" onsubmit="return confirm('Delete this user?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
