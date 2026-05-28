<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IceLevel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IceLevelController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(IceLevel::orderBy('id')->get());
    }

    public function show(IceLevel $iceLevel): JsonResponse
    {
        return response()->json($iceLevel);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);

        return response()->json(IceLevel::create($data), 201);
    }

    public function update(Request $request, IceLevel $iceLevel): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $iceLevel->update($data);

        return response()->json($iceLevel);
    }

    public function destroy(IceLevel $iceLevel): JsonResponse
    {
        $iceLevel->delete();

        return response()->json(['message' => 'Ice level deleted successfully.']);
    }
}
