@extends('layouts.app')

@section('title', 'Roles')

@section('content')
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Roles</h1>
        <a href="{{ route('roles.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add New Role</a>
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
                    <th class="px-4 py-3">Permissions</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($roles as $role)
                    <tr class="border-t">
                        <td class="px-4 py-3">{{ $role->id }}</td>
                        <td class="px-4 py-3">{{ $role->name }}</td>
                        <td class="px-4 py-3">{{ $role->slug }}</td>
                        <td class="px-4 py-3">
                            @foreach ($role->permissions as $perm)
                                <span class="inline-block bg-gray-100 text-xs px-2 py-1 rounded mr-1 mb-1">{{ $perm->name }}</span>
                            @endforeach
                        </td>
                        <td class="px-4 py-3 flex gap-2">
                            <a href="{{ route('roles.show', $role) }}" class="text-blue-600 hover:underline">View</a>
                            <a href="{{ route('roles.edit', $role) }}" class="text-yellow-600 hover:underline">Edit</a>
                            <form action="{{ route('roles.destroy', $role) }}" method="POST" onsubmit="return confirm('Delete this role?')">
                                @csrf @method('DELETE')
                                <button class="text-red-600 hover:underline">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-4">{{ $roles->links() }}</div>
@endsection
