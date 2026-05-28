<?php

namespace App\Http\Controllers\Permissions;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::paginate(10);

        return view('permissions.index', compact('permissions'));
    }

    public function show(Permission $permission)
    {
        return view('permissions.show', compact('permission'));
    }

    public function create()
    {
        return view('permissions.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:permissions,slug',
            'module' => 'nullable|string|max:100',
        ]);

        Permission::create($data);

        return redirect()->route('permissions.index')->with('success', 'Permission created successfully.');
    }

    public function edit(Permission $permission)
    {
        return view('permissions.edit', compact('permission'));
    }

    public function update(Request $request, Permission $permission)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:permissions,slug,'.$permission->id,
            'module' => 'nullable|string|max:100',
        ]);

        $permission->update($data);

        return redirect()->route('permissions.index')->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();

        return redirect()->route('permissions.index')->with('success', 'Permission deleted successfully.');
    }
}
