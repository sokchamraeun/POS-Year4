<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Promotion::withCount('products')->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:percentage,fixed_amount,buy_x_get_y,combo',
            'value' => 'nullable|numeric|min:0',
            'buy_qty' => 'nullable|integer|min:1',
            'free_qty' => 'nullable|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $promotion = Promotion::create($data);

        if (! empty($data['product_ids'])) {
            $promotion->products()->attach($data['product_ids']);
        }

        Cache::flush();
        $promotion->load('products');

        return response()->json($promotion, 201);
    }

    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json($promotion->load('products'));
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:percentage,fixed_amount,buy_x_get_y,combo',
            'value' => 'nullable|numeric|min:0',
            'buy_qty' => 'nullable|integer|min:1',
            'free_qty' => 'nullable|integer|min:1',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'active' => 'boolean',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $promotion->update($data);

        if (array_key_exists('product_ids', $data)) {
            $promotion->products()->sync($data['product_ids'] ?? []);
        }

        Cache::flush();
        $promotion->load('products');

        return response()->json($promotion);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();
        Cache::flush();

        return response()->json(['message' => 'Promotion deleted successfully.']);
    }
}
