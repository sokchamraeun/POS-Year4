@extends('layouts.app')

@section('title', 'Role Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('roles.index') }}" class="text-blue-600 hover:underline">&larr; Back to Roles</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">{{ $role->name }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $role->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Name</dt>
                <dd>{{ $role->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Slug</dt>
                <dd>{{ $role->slug }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Description</dt>
                <dd>{{ $role->description ?? '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Permissions</dt>
                <dd>
                    @foreach ($role->permissions as $perm)
                        <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $perm->name }}</span>
                    @endforeach
                </dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('roles.edit', $role) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('roles.destroy', $role) }}" method="POST" onsubmit="return confirm('Delete this role?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
