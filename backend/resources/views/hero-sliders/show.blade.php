@extends('layouts.app')

@section('title', 'View Hero Slider')

@section('content')
<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="{{ route('hero-sliders.index') }}" class="p-2 rounded-lg hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
            </a>
            <h1 class="text-3xl font-bold text-gray-800">View Hero Slider</h1>
        </div>
        <div class="flex gap-2">
            <a href="{{ route('hero-sliders.edit', $heroSlider->id) }}" class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Edit</a>
            <form action="{{ route('hero-sliders.destroy', $heroSlider->id) }}" method="POST" onsubmit="return confirm('Delete this slider?')">
                @csrf
                @method('DELETE')
                <button type="submit" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
            </form>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="relative h-64 md:h-80">
            <img src="{{ $heroSlider->image }}" alt="" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-6 left-6">
                <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-white">
                    {{ $heroSlider->badge }}
                </span>
            </div>
        </div>

        <div class="p-6 space-y-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">{{ $heroSlider->title }} <span class="text-amber-500">{{ $heroSlider->highlight }}</span></h2>
            </div>

            <p class="text-gray-600">{{ $heroSlider->text }}</p>

            <div class="flex gap-6 text-sm text-gray-500">
                <div>
                    <span class="font-medium">Order:</span> {{ $heroSlider->order }}
                </div>
                <div>
                    <span class="font-medium">Status:</span>
                    @if($heroSlider->is_active)
                        <span class="text-green-600">Active</span>
                    @else
                        <span class="text-red-600">Inactive</span>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection