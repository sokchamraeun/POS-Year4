<?php

namespace App\Http\Controllers\HeroSliders;

use App\Http\Controllers\Controller;
use App\Models\HeroSlider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HeroSliderController extends Controller
{
    public function index()
    {
        $sliders = HeroSlider::orderBy('order')->paginate(10);
        return view('hero-sliders.index', compact('sliders'));
    }

    public function create()
    {
        return view('hero-sliders.create');
    }

    public function store(Request $request)
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

        HeroSlider::create($data);

        return redirect()->route('hero-sliders.index')->with('success', 'Hero slider created successfully.');
    }

    public function show($id)
    {
        $heroSlider = HeroSlider::findOrFail($id);
        return view('hero-sliders.show', compact('heroSlider'));
    }

    public function edit($id)
    {
        $heroSlider = HeroSlider::findOrFail($id);
        return view('hero-sliders.edit', compact('heroSlider'));
    }

    public function update(Request $request, $id)
    {
        $heroSlider = HeroSlider::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'highlight' => 'required|string|max:255',
            'text' => 'required|string',
            'image' => 'required|string',
            'badge' => 'required|string|max:255',
            'order' => 'nullable|integer',
        ]);

        $validated['is_active'] = $request->has('is_active');

        $heroSlider->fill($validated);
        $heroSlider->save();

        return redirect()->route('hero-sliders.index')->with('success', 'Hero slider updated successfully.');
    }

    public function destroy($id)
    {
        $heroSlider = HeroSlider::findOrFail($id);
        $heroSlider->delete();
        return redirect()->route('hero-sliders.index')->with('success', 'Hero slider deleted successfully.');
    }
}