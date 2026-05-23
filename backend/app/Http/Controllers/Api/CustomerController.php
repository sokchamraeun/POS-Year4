<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::withCount('orders');
        if ($request->filled('phone')) {
            $query->where('phone', $request->phone);
        }
        $customers = $query->orderBy('id')->paginate(10);
        return response()->json($customers);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->loadCount('orders');
        return response()->json($customer);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'points' => 'nullable|integer|min:0',
        ]);
        $customer = Customer::create($data);
        return response()->json($customer, 201);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'points' => 'nullable|integer|min:0',
        ]);
        $customer->update($data);
        return response()->json($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted successfully.']);
    }
}
