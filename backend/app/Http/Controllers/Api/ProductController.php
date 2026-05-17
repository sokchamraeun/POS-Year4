<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with(['category', 'sizes', 'addons', 'sugarLevels', 'iceLevels'])->orderBy('id')->paginate(10);
        return response()->json($products);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'sizes', 'addons', 'sugarLevels', 'iceLevels']);
        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'boolean',
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
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $request->boolean('status'),
        ]);

        if (!empty($data['sugar_levels'])) {
            $product->sugarLevels()->attach($data['sugar_levels']);
        }

        if (!empty($data['ice_levels'])) {
            $product->iceLevels()->attach($data['ice_levels']);
        }

        if (!empty($data['sizes'])) {
            $sizeData = [];
            foreach ($data['sizes'] as $size) {
                $sizeData[$size['id']] = ['price' => $size['price'] ?? 0];
            }
            $product->sizes()->attach($sizeData);
        }

        if (!empty($data['addons'])) {
            $product->addons()->attach($data['addons']);
        }

        $product->load(['category', 'sizes', 'addons', 'sugarLevels', 'iceLevels']);
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'boolean',
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
                Storage::disk('public')->delete($product->image);
            }
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product->update([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $request->boolean('status'),
        ]);

        $product->sugarLevels()->detach();
        if (!empty($data['sugar_levels'])) {
            $product->sugarLevels()->attach($data['sugar_levels']);
        }

        $product->iceLevels()->detach();
        if (!empty($data['ice_levels'])) {
            $product->iceLevels()->attach($data['ice_levels']);
        }

        $product->sizes()->detach();
        if (!empty($data['sizes'])) {
            $sizeData = [];
            foreach ($data['sizes'] as $size) {
                $sizeData[$size['id']] = ['price' => $size['price'] ?? 0];
            }
            $product->sizes()->attach($sizeData);
        }
        $product->addons()->detach();
        if (!empty($data['addons'])) {
            $product->addons()->attach($data['addons']);
        }

        $product->load(['category', 'sizes', 'addons', 'sugarLevels', 'iceLevels']);
        return response()->json($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully.']);
    }
}
