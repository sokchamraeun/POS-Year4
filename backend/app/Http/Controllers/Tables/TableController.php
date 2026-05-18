<?php

namespace App\Http\Controllers\Tables;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index()
    {
        $tables = Table::withCount('orders')->orderBy('name')->paginate(10);
        return view('tables.index', compact('tables'));
    }

    public function create()
    {
        return view('tables.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|string|max:50',
        ]);

        Table::create([
            'name' => $data['name'],
            'capacity' => $data['capacity'],
            'status' => $data['status'] ?? 'available',
        ]);

        return redirect()->route('tables.index')->with('success', 'Table created successfully.');
    }

    public function show(Table $table)
    {
        $table->loadCount('orders');
        return view('tables.show', compact('table'));
    }

    public function edit(Table $table)
    {
        return view('tables.edit', compact('table'));
    }

    public function update(Request $request, Table $table)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|string|max:50',
        ]);

        $table->update([
            'name' => $data['name'],
            'capacity' => $data['capacity'],
            'status' => $data['status'] ?? 'available',
        ]);

        return redirect()->route('tables.index')->with('success', 'Table updated successfully.');
    }

    public function destroy(Table $table)
    {
        $table->delete();
        return redirect()->route('tables.index')->with('success', 'Table deleted successfully.');
    }
}
