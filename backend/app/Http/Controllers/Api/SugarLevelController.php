<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SugarLevel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SugarLevelController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SugarLevel::orderBy('id')->get());
    }

    public function show(SugarLevel $sugarLevel): JsonResponse
    {
        return response()->json($sugarLevel);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'requires_input' => 'boolean',
        ]);

        return response()->json(SugarLevel::create($data), 201);
    }

    public function update(Request $request, SugarLevel $sugarLevel): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'requires_input' => 'boolean',
        ]);
        $sugarLevel->update($data);

        return response()->json($sugarLevel);
    }

    public function destroy(SugarLevel $sugarLevel): JsonResponse
    {
        $sugarLevel->delete();

        return response()->json(['message' => 'Sugar level deleted successfully.']);
    }
}
