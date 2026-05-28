<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroSlider;
use App\Services\CloudinaryService;
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

    public function store(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'highlight' => 'required|string|max:255',
            'text' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'badge' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $imageUrl = $cloudinary->upload($request->file('image'), 'hero-sliders');
        $data['image'] = $imageUrl;

        $slider = HeroSlider::create($data);

        return response()->json($slider, 201);
    }

    public function update(Request $request, HeroSlider $heroSlider, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'highlight' => 'required|string|max:255',
            'text' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'badge' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $cloudinary->delete($heroSlider->image);
            $data['image'] = $cloudinary->upload($request->file('image'), 'hero-sliders');
        } else {
            unset($data['image']);
        }

        $heroSlider->update($data);

        return response()->json($heroSlider);
    }

    public function destroy(HeroSlider $heroSlider, CloudinaryService $cloudinary): JsonResponse
    {
        $cloudinary->delete($heroSlider->image);
        $heroSlider->delete();

        return response()->json(['message' => 'Hero slider deleted successfully.']);
    }
}
