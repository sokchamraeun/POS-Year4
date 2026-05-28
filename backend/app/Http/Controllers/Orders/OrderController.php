<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['customer', 'table', 'items.product'])
            ->orderByDesc('id')->paginate(15);

        return view('orders.index', compact('orders'));
    }

    public function show(Order $order)
    {
        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);

        return view('orders.show', compact('order'));
    }
}
