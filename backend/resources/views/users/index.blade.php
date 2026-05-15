@extends('layouts.app')

@section('title', 'Users')

@section('content')
<div class="space-y-6">

    {{-- Header --}}
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">Users Management</h1>
            <p class="text-gray-500 mt-1">Manage all system users and permissions.</p>
        </div>

        <a href="{{ route('users.create') }}"
           class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add User
        </a>
    </div>

    {{-- Success Message --}}
    @if (session('success'))
        <div class="bg-green-100 border border-green-300 text-green-700 px-5 py-4 rounded-xl shadow-sm">
            {{ session('success') }}
        </div>
    @endif

    {{-- Table Card --}}
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

        {{-- Table Header --}}
        <div class="px-6 py-4 border-b bg-gray-50">
            <h2 class="text-lg font-semibold text-gray-700">User List</h2>
        </div>

        {{-- Table --}}
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">User</th>
                        <th class="px-6 py-4">Role</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    @foreach ($users as $user)
                        <tr class="hover:bg-gray-50 transition">

                            {{-- ID --}}
                            <td class="px-6 py-4 font-medium text-gray-700">
                                #{{ $user->id }}
                            </td>

                            {{-- User Info --}}
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">

                                    {{-- Avatar --}}
                                    <div class="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                        {{ strtoupper(substr($user->name, 0, 1)) }}
                                    </div>

                                    <div>
                                        <div class="font-semibold text-gray-800">
                                            {{ $user->name }}
                                        </div>
                                        <div class="text-gray-500 text-sm">
                                            {{ $user->email }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {{-- Role --}}
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                    {{ $user->role?->name ?? 'No Role' }}
                                </span>
                            </td>

                            {{-- Status --}}
                            <td class="px-6 py-4">
                                @if($user->status)
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                        Active
                                    </span>
                                @else
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                        Inactive
                                    </span>
                                @endif
                            </td>

                            {{-- Actions --}}
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-center gap-2">

                                    {{-- View --}}
                                    <a href="{{ route('users.show', $user) }}"
                                       class="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition text-sm font-medium">
                                        View
                                    </a>

                                    {{-- Edit --}}
                                    <a href="{{ route('users.edit', $user) }}"
                                       class="px-3 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition text-sm font-medium">
                                        Edit
                                    </a>

                                    {{-- Delete --}}
                                    <form action="{{ route('users.destroy', $user) }}"
                                          method="POST"
                                          onsubmit="return confirm('Delete this user?')">
                                        @csrf
                                        @method('DELETE')

                                        <button type="submit"
                                                class="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition text-sm font-medium">
                                            Delete
                                        </button>
                                    </form>

                                </div>
                            </td>

                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- Pagination --}}
        <div class="px-6 py-4 border-t bg-gray-50">
            {{ $users->links() }}
        </div>

    </div>
</div>
@endsection