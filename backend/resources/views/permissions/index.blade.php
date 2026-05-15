@extends('layouts.app')

@section('title', 'Permissions')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Permissions</h1>
        <a href="{{ route('permissions.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Permission</a>
    </div>

    @if (session('success'))
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{{ session('success') }}</div>
    @endif

    <div class="bg-white rounded shadow overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-100 text-left">
                    <th class="px-4 py-3">ID</th>
                    <th class="px-4 py-3">Name</th>
                    <th class="px-4 py-3">Slug</th>
                    <th class="px-4 py-3">Module</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($permissions as $permission)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $permission->id }}</td>
                        <td class="px-4 py-3">{{ $permission->name }}</td>
                        <td class="px-4 py-3">{{ $permission->slug }}</td>
                        <td class="px-4 py-3">{{ $permission->module ?? '-' }}</td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('permissions.show', $permission) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('permissions.edit', $permission) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('permissions.destroy', $permission) }}" method="POST" onsubmit="return confirm('Delete this permission?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $permissions->links() }}</div>
@endsection
