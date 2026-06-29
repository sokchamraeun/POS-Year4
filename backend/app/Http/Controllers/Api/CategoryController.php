<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 100), 500);
        $categories = Category::withCount('products')->orderBy('id')->paginate($perPage);

        return response()->json($categories);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('products');
        $category->load(['products' => fn ($q) => $q->with('category')->orderBy('name')]);

        return response()->json($category);
    }

    public function store(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $cloudinary->upload($request->file('image'), 'categories');
        } else {
            unset($data['image']);
        }

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($category->image) {
                $cloudinary->delete($category->image);
            }
            $data['image'] = $cloudinary->upload($request->file('image'), 'categories');
        } else {
            unset($data['image']);
        }

        $category->update($data);

        return response()->json($category);
    }

    public function destroy(Category $category, CloudinaryService $cloudinary): JsonResponse
    {
        if ($category->image) {
            $cloudinary->delete($category->image);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
