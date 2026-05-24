@extends('layouts.app')

@section('title', 'Hero Sliders')

@section('content')
<div class="space-y-6">

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">Hero Sliders</h1>
            <p class="text-gray-500 mt-1">Manage homepage hero slider content.</p>
        </div>

        <a href="{{ route('hero-sliders.create') }}"
           class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Slider
        </a>
    </div>

    @if (session('success'))
        <div class="bg-green-100 border border-green-300 text-green-700 px-5 py-4 rounded-xl shadow-sm">
            {{ session('success') }}
        </div>
    @endif

    <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div class="px-6 py-4 border-b bg-gray-50">
            <h2 class="text-lg font-semibold text-gray-700">Slider List</h2>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Image</th>
                        <th class="px-6 py-4">Title</th>
                        <th class="px-6 py-4">Highlight</th>
                        <th class="px-6 py-4">Badge</th>
                        <th class="px-6 py-4">Order</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-center">Actions</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    @foreach ($sliders as $slider)
                        <tr class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4 font-medium text-gray-700">#{{ $slider->id }}</td>
                            <td class="px-6 py-4">
                                <img src="{{ $slider->image }}" alt="" class="w-20 h-12 object-cover rounded-lg">
                            </td>
                            <td class="px-6 py-4 text-gray-800">{{ $slider->title }}</td>
                            <td class="px-6 py-4 text-gray-800">{{ $slider->highlight }}</td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                    {{ $slider->badge }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-gray-600">{{ $slider->order }}</td>
                            <td class="px-6 py-4">
                                @if($slider->is_active)
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                                @else
                                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Inactive</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center justify-center gap-2">
                                    <a href="{{ route('hero-sliders.show', $slider->id) }}" class="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition text-sm font-medium">View</a>
                                    <a href="{{ route('hero-sliders.edit', $slider->id) }}" class="px-3 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition text-sm font-medium">Edit</a>
                                    <form action="{{ route('hero-sliders.destroy', $slider->id) }}" method="POST" onsubmit="return confirm('Delete this slider?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition text-sm font-medium">Delete</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="px-6 py-4 border-t bg-gray-50">
            {{ $sliders->links() }}
        </div>
    </div>
</div>
@endsection