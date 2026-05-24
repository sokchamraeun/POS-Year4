<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroSlider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroSliderController extends Controller
{
    public function index(): JsonResponse
    {
        $sliders = HeroSlider::orderBy('order')->paginate(10);
        return response()->json($sliders);
    }

    public function show(HeroSlider $heroSlider): JsonResponse
    {
        return response()->json($heroSlider);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'highlight' => 'required|string|max:255',
            'text' => 'required|string',
            'image' => 'required|string',
            'badge' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $slider = HeroSlider::create($data);
        return response()->json($slider, 201);
    }

    public function update(Request $request, HeroSlider $heroSlider): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'highlight' => 'required|string|max:255',
            'text' => 'required|string',
            'image' => 'required|string',
            'badge' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $heroSlider->update($data);
        return response()->json($heroSlider);
    }

    public function destroy(HeroSlider $heroSlider): JsonResponse
    {
        $heroSlider->delete();
        return response()->json(['message' => 'Hero slider deleted successfully.']);
    }
}