<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Size::orderBy('id')->get());
    }

    public function show(Size $size): JsonResponse
    {
        return response()->json($size);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        return response()->json(Size::create($data), 201);
    }

    public function update(Request $request, Size $size): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $size->update($data);
        return response()->json($size);
    }

    public function destroy(Size $size): JsonResponse
    {
        $size->delete();
        return response()->json(['message' => 'Size deleted successfully.']);
    }
}
