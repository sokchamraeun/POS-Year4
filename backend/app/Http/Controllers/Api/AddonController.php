<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Addon;
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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);
        $addon = Addon::create($data);

        return response()->json($addon, 201);
    }

    public function update(Request $request, Addon $addon): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);
        $addon->update($data);

        return response()->json($addon);
    }

    public function destroy(Addon $addon): JsonResponse
    {
        $addon->delete();

        return response()->json(['message' => 'Addon deleted successfully.']);
    }
}
