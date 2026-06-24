<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index(): JsonResponse
    {
        $addons = Addon::withCount('products')->orderBy('id')->paginate(10);

        return response()->json($addons);
    }

    public function show(Addon $addon): JsonResponse
    {
        $addon->loadCount('products');

        return response()->json($addon);
    }

    public function store(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'price' => 'required|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $cloudinary->upload($request->file('image'), 'addons');
        } else {
            unset($data['image']);
        }

        $addon = Addon::create($data);

        return response()->json($addon, 201);
    }

    public function update(Request $request, Addon $addon, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'price' => 'required|numeric|min:0',
        ]);

        if ($request->hasFile('image')) {
            if ($addon->image) {
                $cloudinary->delete($addon->image);
            }
            $data['image'] = $cloudinary->upload($request->file('image'), 'addons');
        } else {
            unset($data['image']);
        }

        $addon->update($data);

        return response()->json($addon);
    }

    public function destroy(Addon $addon, CloudinaryService $cloudinary): JsonResponse
    {
        if ($addon->image) {
            $cloudinary->delete($addon->image);
        }

        $addon->delete();

        return response()->json(['message' => 'Addon deleted successfully.']);
    }
}
