@extends('layouts.app')

@section('title', 'Create Product')

@section('content')
    <div class="mb-6">
        <a href="{{ route('products.index') }}" class="text-blue-600 hover:underline">&larr; Back to Products</a>
    </div>

    <div class="bg-white rounded shadow p-6 max-w-2xl">
        <h1 class="text-2xl font-bold mb-4">Add New Product</h1>

        <form action="{{ route('products.store') }}" method="POST" enctype="multipart/form-data">
            @csrf

            <div class="mb-4">
                <label for="name" class="block font-medium mb-1">Name</label>
                <input type="text" name="name" id="name" value="{{ old('name') }}" class="w-full border rounded px-3 py-2 @error('name') border-red-500 @enderror" required>
                @error('name') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="category_id" class="block font-medium mb-1">Category</label>
                <select name="category_id" id="category_id" class="w-full border rounded px-3 py-2 @error('category_id') border-red-500 @enderror" required>
                    <option value="">Select Category</option>
                    @foreach ($categories as $category)
                        <option value="{{ $category->id }}" {{ old('category_id') == $category->id ? 'selected' : '' }}>{{ $category->name }}</option>
                    @endforeach
                </select>
                @error('category_id') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label for="description" class="block font-medium mb-1">Description</label>
                <textarea name="description" id="description" rows="3" class="w-full border rounded px-3 py-2">{{ old('description') }}</textarea>
            </div>

            <div class="mb-4">
                <label for="image" class="block font-medium mb-1">Image</label>
                <input type="file" name="image" id="image" class="w-full border rounded px-3 py-2">
                @error('image') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="status" value="1" {{ old('status', true) ? 'checked' : '' }}>
                    <span class="font-medium">Active</span>
                </label>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-2">Available Sugar Levels</label>
                <div class="grid grid-cols-2 gap-2">
                    @foreach ($sugarLevels as $level)
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="sugar_levels[]" value="{{ $level->id }}" {{ in_array($level->id, old('sugar_levels', [])) ? 'checked' : '' }}>
                            <span>{{ $level->name }}</span>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-2">Available Ice Levels</label>
                <div class="grid grid-cols-2 gap-2">
                    @foreach ($iceLevels as $level)
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="ice_levels[]" value="{{ $level->id }}" {{ in_array($level->id, old('ice_levels', [])) ? 'checked' : '' }}>
                            <span>{{ $level->name }}</span>
                        </label>
                    @endforeach
                </div>
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-2">Sizes &amp; Prices</label>
                <div class="space-y-2">
                    @foreach ($sizes as $size)
                        <div class="flex items-center gap-3">
                            <label class="flex items-center gap-2 cursor-pointer w-32">
                                <input type="checkbox" name="sizes[]" value="{{ $size->id }}" {{ in_array($size->id, old('sizes', [])) ? 'checked' : '' }}>
                                <span>{{ $size->name }}</span>
                            </label>
                            <input type="number" name="prices[{{ $size->id }}]" value="{{ old('prices.' . $size->id) }}" placeholder="Price" step="0.01" min="0" class="w-32 border rounded px-2 py-1">
                        </div>
                    @endforeach
                </div>
                @error('sizes') <p class="text-red-500 text-sm mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="mb-4">
                <label class="block font-medium mb-2">Available Addons</label>
                <div class="grid grid-cols-2 gap-2">
                    @foreach ($addons as $addon)
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="addons[]" value="{{ $addon->id }}" {{ in_array($addon->id, old('addons', [])) ? 'checked' : '' }}>
                            <span>{{ $addon->name }} (${{ number_format($addon->price, 2) }})</span>
                        </label>
                    @endforeach
                </div>
            </div>

            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Product</button>
        </form>
    </div>
@endsection
