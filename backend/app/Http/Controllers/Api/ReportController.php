<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = Order::query();
        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);

        $totalSales = (clone $query)->whereIn('payment_status', ['Paid', 'Refunded'])->sum('total');
        $totalOrders = (clone $query)->count();
        $paidOrders = (clone $query)->where('payment_status', 'Paid')->count();
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        $daily = (clone $query)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as orders'), DB::raw('COALESCE(SUM(total), 0) as revenue'))
            ->whereIn('payment_status', ['Paid', 'Refunded'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $paymentMethod = (clone $query)
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('COALESCE(SUM(total), 0) as revenue'))
            ->whereIn('payment_status', ['Paid', 'Refunded'])
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->get();

        $bestSellers = OrderItem::select('product_id', DB::raw('SUM(qty) as total_qty'), DB::raw('COALESCE(SUM(subtotal), 0) as revenue'))
            ->whereHas('order', function ($q) use ($from, $to) {
                if ($from) $q->whereDate('created_at', '>=', $from);
                if ($to) $q->whereDate('created_at', '<=', $to);
                $q->whereIn('payment_status', ['Paid', 'Refunded']);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->with('product:id,name')
            ->get();

        return response()->json([
            'total_sales' => round($totalSales, 2),
            'total_orders' => $totalOrders,
            'paid_orders' => $paidOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'daily' => $daily,
            'payment_methods' => $paymentMethod,
            'best_sellers' => $bestSellers,
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $items = OrderItem::select(
            'product_id',
            'size_id',
            DB::raw('SUM(qty) as total_qty'),
            DB::raw('COALESCE(SUM(subtotal), 0) as revenue')
        )
            ->whereHas('order', function ($q) use ($from, $to) {
                if ($from) $q->whereDate('created_at', '>=', $from);
                if ($to) $q->whereDate('created_at', '<=', $to);
                $q->whereIn('payment_status', ['Paid', 'Refunded']);
            })
            ->groupBy('product_id', 'size_id')
            ->orderByDesc('total_qty')
            ->with('product:id,name', 'size:id,name')
            ->get();

        return response()->json($items);
    }

    public function inventory(): JsonResponse
    {
        $ingredients = Ingredient::withCount('inventoryTransactions')
            ->orderBy('name')
            ->get()
            ->map(fn($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'unit' => $i->unit,
                'stock_quantity' => (float) $i->stock_quantity,
                'reorder_level' => (float) $i->reorder_level,
                'status' => $i->stock_quantity <= 0 ? 'Out of Stock' : ($i->stock_quantity <= $i->reorder_level ? 'Low Stock' : 'In Stock'),
                'transactions_count' => $i->inventory_transactions_count,
            ]);

        $lowStock = $ingredients->filter(fn($i) => $i['status'] === 'Low Stock' || $i['status'] === 'Out of Stock')->values();

        return response()->json([
            'ingredients' => $ingredients,
            'low_stock' => $lowStock,
            'total_ingredients' => $ingredients->count(),
            'low_stock_count' => $lowStock->count(),
        ]);
    }

    public function purchases(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = InventoryTransaction::with('ingredient:id,name,unit')
            ->where('type', 'purchase')
            ->orderByDesc('id');

        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);

        $transactions = $query->paginate(20);

        $summary = [
            'total_transactions' => $transactions->total(),
            'total_quantity' => (float) InventoryTransaction::where('type', 'purchase')
                ->when($from, fn($q) => $q->whereDate('created_at', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('created_at', '<=', $to))
                ->sum('quantity'),
        ];

        return response()->json([
            'transactions' => $transactions->items(),
            'summary' => $summary,
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function profit(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = Order::whereIn('payment_status', ['Paid', 'Refunded']);
        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);

        $revenue = (float) (clone $query)->sum('total');

        $driver = DB::connection()->getDriverName();
        $monthExpr = match ($driver) {
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', created_at)",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };
        $monthly = (clone $query)
            ->select(DB::raw("{$monthExpr} as month"), DB::raw('COALESCE(SUM(total), 0) as revenue'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'revenue' => $revenue,
            'monthly' => $monthly,
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = Customer::withCount(['orders' => function ($q) use ($from, $to) {
            if ($from) $q->whereDate('created_at', '>=', $from);
            if ($to) $q->whereDate('created_at', '<=', $to);
        }]);

        $customers = $query->orderByDesc('orders_count')->limit(50)->get()->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'phone' => $c->phone,
            'points' => $c->points,
            'orders_count' => $c->orders_count,
            'total_spent' => (float) $c->orders()
                ->whereIn('payment_status', ['Paid', 'Refunded'])
                ->when($from, fn($q) => $q->whereDate('created_at', '>=', $from))
                ->when($to, fn($q) => $q->whereDate('created_at', '<=', $to))
                ->sum('total'),
            'created_at' => $c->created_at,
        ]);

        $totalCustomers = Customer::count();
        $newCustomers = Customer::when($from, fn($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn($q) => $q->whereDate('created_at', '<=', $to))
            ->count();

        return response()->json([
            'customers' => $customers,
            'total_customers' => $totalCustomers,
            'new_customers' => $newCustomers,
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = Order::query();
        if ($from) $query->whereDate('created_at', '>=', $from);
        if ($to) $query->whereDate('created_at', '<=', $to);

        $byMethod = (clone $query)
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('COALESCE(SUM(total), 0) as revenue'))
            ->whereIn('payment_status', ['Paid', 'Refunded'])
            ->whereNotNull('payment_method')
            ->groupBy('payment_method')
            ->get();

        $byStatus = (clone $query)
            ->select('payment_status', DB::raw('COUNT(*) as count'))
            ->groupBy('payment_status')
            ->get();

        return response()->json([
            'by_method' => $byMethod,
            'by_status' => $byStatus,
        ]);
    }
}
