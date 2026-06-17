<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 100), 500);
        $data = Product::with(['category', 'sizes', 'addons.sizePrices', 'sugarLevels', 'iceLevels', 'promotions'])
            ->orderBy('id')
            ->paginate($perPage);

        return response()->json($data);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'sizes', 'addons.sizePrices', 'sugarLevels', 'iceLevels', 'promotions']);

        return response()->json($product);
    }

    public function store(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'boolean',
            'is_featured' => 'boolean',
            'sugar_levels' => 'nullable|array',
            'sugar_levels.*' => 'exists:sugar_levels,id',
            'ice_levels' => 'nullable|array',
            'ice_levels.*' => 'exists:ice_levels,id',
            'sizes' => 'nullable|array',
            'sizes.*.id' => 'exists:sizes,id',
            'sizes.*.price' => 'numeric|min:0',
            'addons' => 'nullable|array',
            'addons.*' => 'exists:addons,id',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $cloudinary->upload($request->file('image'));
        }

        $product = Product::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $request->boolean('status'),
            'is_featured' => $request->boolean('is_featured'),
        ]);

        if (! empty($data['sugar_levels'])) {
            $product->sugarLevels()->attach($data['sugar_levels']);
        }

        if (! empty($data['ice_levels'])) {
            $product->iceLevels()->attach($data['ice_levels']);
        }

        if (! empty($data['sizes'])) {
            $sizeData = [];
            foreach ($data['sizes'] as $size) {
                $sizeData[$size['id']] = ['price' => $size['price'] ?? 0];
            }
            $product->sizes()->attach($sizeData);
        }

        if (! empty($data['addons'])) {
            $product->addons()->attach($data['addons']);
        }

        Cache::flush();
        $product->load(['category', 'sizes', 'addons.sizePrices', 'sugarLevels', 'iceLevels', 'promotions']);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'boolean',
            'is_featured' => 'boolean',
            'sugar_levels' => 'nullable|array',
            'sugar_levels.*' => 'exists:sugar_levels,id',
            'ice_levels' => 'nullable|array',
            'ice_levels.*' => 'exists:ice_levels,id',
            'sizes' => 'nullable|array',
            'sizes.*.id' => 'exists:sizes,id',
            'sizes.*.price' => 'numeric|min:0',
            'addons' => 'nullable|array',
            'addons.*' => 'exists:addons,id',
        ]);

        $imagePath = $product->image;
        if ($request->hasFile('image')) {
            if ($product->image) {
                $cloudinary->delete($product->image);
            }
            $imagePath = $cloudinary->upload($request->file('image'));
        }

        $product->update([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $request->boolean('status'),
            'is_featured' => $request->boolean('is_featured'),
        ]);

        $product->sugarLevels()->sync($data['sugar_levels'] ?? []);
        $product->iceLevels()->sync($data['ice_levels'] ?? []);

        if (! empty($data['sizes'])) {
            $sizeData = [];
            foreach ($data['sizes'] as $size) {
                $sizeData[$size['id']] = ['price' => $size['price'] ?? 0];
            }
            $product->sizes()->sync($sizeData);
        } else {
            $product->sizes()->sync([]);
        }
        $product->addons()->sync($data['addons'] ?? []);

        Cache::flush();
        $product->load(['category', 'sizes', 'addons.sizePrices', 'sugarLevels', 'iceLevels', 'promotions']);

        return response()->json($product);
    }

    public function updateCategory(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $product->update(['category_id' => $data['category_id']]);
        $product->load('category');

        return response()->json($product);
    }

    public function toggleFeatured(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'is_featured' => 'required|boolean',
        ]);

        $product->update(['is_featured' => $data['is_featured']]);
        Cache::flush();

        return response()->json(['id' => $product->id, 'is_featured' => $product->is_featured]);
    }

    public function destroy(Product $product, CloudinaryService $cloudinary): JsonResponse
    {
        if ($product->image) {
            $cloudinary->delete($product->image);
        }
        $product->delete();
        Cache::flush();

        return response()->json(['message' => 'Product deleted successfully.']);
    }
}
