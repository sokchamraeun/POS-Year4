<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')->orderBy('id')->paginate(10);
        return response()->json($categories);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('products');
        return response()->json($category);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $category = Category::create($data);
        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $category->update($data);
        return response()->json($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
