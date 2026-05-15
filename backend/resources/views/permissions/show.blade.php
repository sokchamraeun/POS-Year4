@extends('layouts.app')

@section('title', 'Permission Details')

@section('content')
    <div class="mb-6">
        <a href="{{ route('permissions.index') }}" class="text-blue-600 hover:underline">&larr; Back to Permissions</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">{{ $permission->name }}</h1>

        <dl class="space-y-3">
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">ID</dt>
                <dd>{{ $permission->id }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Name</dt>
                <dd>{{ $permission->name }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Slug</dt>
                <dd>{{ $permission->slug }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Module</dt>
                <dd>{{ $permission->module ?? '-' }}</dd>
            </div>
            <div class="flex">
                <dt class="w-32 font-medium text-gray-600">Created</dt>
                <dd>{{ $permission->created_at->format('M d, Y H:i') }}</dd>
            </div>
        </dl>

        <div class="flex gap-2 mt-6">
            <a href="{{ route('permissions.edit', $permission) }}" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Edit</a>
            <form action="{{ route('permissions.destroy', $permission) }}" method="POST" onsubmit="return confirm('Delete this permission?')">
                @csrf @method('DELETE')
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
            </form>
        </div>
    </div>
@endsection
