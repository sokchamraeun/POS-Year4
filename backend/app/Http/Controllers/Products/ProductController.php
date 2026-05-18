<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Models\Category;
use App\Models\IceLevel;
use App\Models\Product;
use App\Services\CloudinaryService;
use App\Models\Size;
use App\Models\SugarLevel;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'sizes', 'addons', 'sugarLevels', 'iceLevels'])->paginate(10);
        return view('products.index', compact('products'));
    }

    public function create()
    {
        $categories = Category::all();
        $sizes = Size::all();
        $addons = Addon::all();
        $sugarLevels = SugarLevel::all();
        $iceLevels = IceLevel::all();
        return view('products.create', compact('categories', 'sizes', 'addons', 'sugarLevels', 'iceLevels'));
    }

    public function store(Request $request, CloudinaryService $cloudinary)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|boolean',
            'sizes' => 'nullable|array',
            'sizes.*' => 'exists:sizes,id',
            'prices' => 'nullable|array',
            'prices.*' => 'nullable|numeric|min:0',
            'sugar_levels' => 'nullable|array',
            'sugar_levels.*' => 'exists:sugar_levels,id',
            'ice_levels' => 'nullable|array',
            'ice_levels.*' => 'exists:ice_levels,id',
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
        ]);

        if (!empty($data['sugar_levels'])) {
            $product->sugarLevels()->attach($data['sugar_levels']);
        }

        if (!empty($data['ice_levels'])) {
            $product->iceLevels()->attach($data['ice_levels']);
        }

        if (!empty($data['sizes'])) {
            $sizeData = [];
            foreach ($data['sizes'] as $sizeId) {
                $price = $data['prices'][$sizeId] ?? 0;
                $sizeData[$sizeId] = ['price' => is_numeric($price) ? (float)$price : 0];
            }
            $product->sizes()->attach($sizeData);
        }

        if (!empty($data['addons'])) {
            $product->addons()->attach($data['addons']);
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'sizes', 'addons', 'sugarLevels', 'iceLevels']);
        return view('products.show', compact('product'));
    }

    public function edit(Product $product)
    {
        $product->load(['sizes', 'addons', 'sugarLevels', 'iceLevels']);
        $categories = Category::all();
        $sizes = Size::all();
        $addons = Addon::all();
        $sugarLevels = SugarLevel::all();
        $iceLevels = IceLevel::all();
        return view('products.edit', compact('product', 'categories', 'sizes', 'addons', 'sugarLevels', 'iceLevels'));
    }

    public function update(Request $request, Product $product, CloudinaryService $cloudinary)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'status' => 'nullable|boolean',
            'sizes' => 'nullable|array',
            'sizes.*' => 'exists:sizes,id',
            'prices' => 'nullable|array',
            'prices.*' => 'nullable|numeric|min:0',
            'sugar_levels' => 'nullable|array',
            'sugar_levels.*' => 'exists:sugar_levels,id',
            'ice_levels' => 'nullable|array',
            'ice_levels.*' => 'exists:ice_levels,id',
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
            foreach ($data['sizes'] as $sizeId) {
                $price = $data['prices'][$sizeId] ?? 0;
                $sizeData[$sizeId] = ['price' => is_numeric($price) ? (float)$price : 0];
            }
            $product->sizes()->attach($sizeData);
        }
        $product->addons()->detach();
        if (!empty($data['addons'])) {
            $product->addons()->attach($data['addons']);
        }

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product, CloudinaryService $cloudinary)
    {
        if ($product->image) {
            $cloudinary->delete($product->image);
        }
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }
}
