<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = Table::withCount('orders')->orderBy('name')->paginate(10);
        return response()->json($tables);
    }

    public function show(Table $table): JsonResponse
    {
        $table->loadCount('orders');
        return response()->json($table);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|string|max:50',
        ]);

        $table = Table::create([
            'name' => $data['name'],
            'capacity' => $data['capacity'],
            'status' => $data['status'] ?? 'available',
        ]);

        return response()->json($table, 201);
    }

    public function update(Request $request, Table $table): JsonResponse
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

        return response()->json($table);
    }

    public function destroy(Table $table): JsonResponse
    {
        $table->delete();
        return response()->json(['message' => 'Table deleted successfully.']);
    }

    public function available(): JsonResponse
    {
        $tables = Table::where('status', 'available')->orderBy('name')->get();
        return response()->json($tables);
    }
}
