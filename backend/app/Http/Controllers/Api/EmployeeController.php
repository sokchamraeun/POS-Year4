<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with('user.role');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $employees = $query->orderBy('id')->paginate(1000);

        return response()->json($employees);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load('user.role');

        return response()->json($employee);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'position' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'status' => 'boolean',
        ]);

        $employee = Employee::create($data);

        if ($employee->user_id) {
            $employee->user()->update([
                'status' => $employee->status,
                'phone' => $employee->phone,
            ]);
        }

        $employee->load('user.role');

        return response()->json($employee, 201);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $data = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'full_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'position' => 'nullable|string|max:100',
            'salary' => 'nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
            'status' => 'boolean',
        ]);

        $employee->update($data);

        if ($employee->user_id) {
            $employee->user()->update([
                'status' => $employee->status,
                'phone' => $employee->phone,
            ]);
        }

        $employee->load('user.role');

        return response()->json($employee);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully.']);
    }
}
