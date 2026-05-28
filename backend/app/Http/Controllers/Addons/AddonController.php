<?php

namespace App\Http\Controllers\Addons;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index()
    {
        $addons = Addon::withCount('products')->paginate(10);

        return view('addons.index', compact('addons'));
    }

    public function create()
    {
        return view('addons.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        Addon::create($data);

        return redirect()->route('addons.index')->with('success', 'Addon created successfully.');
    }

    public function show(Addon $addon)
    {
        $addon->loadCount('products');

        return view('addons.show', compact('addon'));
    }

    public function edit(Addon $addon)
    {
        return view('addons.edit', compact('addon'));
    }

    public function update(Request $request, Addon $addon)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $addon->update($data);

        return redirect()->route('addons.index')->with('success', 'Addon updated successfully.');
    }

    public function destroy(Addon $addon)
    {
        $addon->delete();

        return redirect()->route('addons.index')->with('success', 'Addon deleted successfully.');
    }
}
