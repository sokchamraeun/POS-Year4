<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $permissions = Permission::paginate(50);

        return response()->json($permissions);
    }

    public function show(Permission $permission): JsonResponse
    {
        return response()->json($permission);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:permissions,slug',
            'module' => 'nullable|string|max:100',
        ]);

        $permission = Permission::create($data);

        return response()->json($permission, 201);
    }

    public function update(Request $request, Permission $permission): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:permissions,slug,'.$permission->id,
            'module' => 'nullable|string|max:100',
        ]);

        $permission->update($data);

        return response()->json($permission);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $permission->delete();

        return response()->json(['message' => 'Permission deleted successfully.']);
    }
}
