<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Recipe;
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
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

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
                if ($from) {
                    $q->whereDate('created_at', '>=', $from);
                }
                if ($to) {
                    $q->whereDate('created_at', '<=', $to);
                }
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
                if ($from) {
                    $q->whereDate('created_at', '>=', $from);
                }
                if ($to) {
                    $q->whereDate('created_at', '<=', $to);
                }
                $q->whereIn('payment_status', ['Paid', 'Refunded']);
            })
            ->groupBy('product_id', 'size_id')
            ->orderByDesc('total_qty')
            ->with('product:id,name', 'size:id,name')
            ->get();

        return response()->json($items);
    }

    public function inventory(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 100), 500);
        $ingredients = Ingredient::withCount('inventoryTransactions')
            ->orderBy('name')
            ->paginate($perPage)
            ->through(fn ($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'unit' => $i->unit,
                'stock_quantity' => (float) $i->stock_quantity,
                'reorder_level' => (float) $i->reorder_level,
                'status' => $i->stock_quantity <= 0 ? 'Out of Stock' : ($i->stock_quantity <= $i->reorder_level ? 'Low Stock' : 'In Stock'),
                'transactions_count' => $i->inventory_transactions_count,
            ]);

        $all = Ingredient::selectRaw("CASE WHEN stock_quantity <= 0 THEN 'Out of Stock' WHEN stock_quantity <= reorder_level THEN 'Low Stock' ELSE 'In Stock' END as status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'ingredients' => $ingredients->items(),
            'pagination' => [
                'current_page' => $ingredients->currentPage(),
                'last_page' => $ingredients->lastPage(),
                'total' => $ingredients->total(),
            ],
            'low_stock_count' => ($all['Low Stock'] ?? 0) + ($all['Out of Stock'] ?? 0),
            'total_ingredients' => $ingredients->total(),
        ]);
    }

    public function purchases(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = InventoryTransaction::with('ingredient:id,name,unit')
            ->where('type', 'purchase')
            ->orderByDesc('id');

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $transactions = $query->paginate(20);

        $summary = [
            'total_transactions' => $transactions->total(),
            'total_quantity' => (float) InventoryTransaction::where('type', 'purchase')
                ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
                ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
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
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

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

        $customers = Customer::select('customers.*')
            ->selectSub(function ($q) use ($from, $to) {
                $q->selectRaw('COALESCE(SUM(orders.total), 0)')
                    ->from('orders')
                    ->whereColumn('orders.customer_id', 'customers.id')
                    ->whereIn('orders.payment_status', ['Paid', 'Refunded'])
                    ->when($from, fn ($q) => $q->whereDate('orders.created_at', '>=', $from))
                    ->when($to, fn ($q) => $q->whereDate('orders.created_at', '<=', $to));
            }, 'total_spent')
            ->withCount(['orders' => function ($q) use ($from, $to) {
                if ($from) {
                    $q->whereDate('created_at', '>=', $from);
                }
                if ($to) {
                    $q->whereDate('created_at', '<=', $to);
                }
            }])
            ->orderByDesc('orders_count')
            ->limit(50)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'points' => $c->points,
                'orders_count' => $c->orders_count,
                'total_spent' => (float) $c->total_spent,
                'created_at' => $c->created_at,
            ]);

        $totalCustomers = Customer::count();
        $newCustomers = Customer::when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->count();

        return response()->json([
            'customers' => $customers,
            'total_customers' => $totalCustomers,
            'new_customers' => $newCustomers,
        ]);
    }

    public function profitToday(): JsonResponse
    {
        $tz       = 'Asia/Phnom_Penh';
        $dayStart = now()->timezone($tz)->startOfDay()->utc()->toDateTimeString();
        $dayEnd   = now()->timezone($tz)->endOfDay()->utc()->toDateTimeString();

        // Revenue and order count from paid orders today
        $paidOrderIds = Order::whereBetween('created_at', [$dayStart, $dayEnd])
            ->where('payment_status', 'Paid')
            ->pluck('id');

        $revenue = (float) Order::whereIn('id', $paidOrderIds)->sum('total');
        $count   = $paidOrderIds->count();

        // Get all items from paid orders today
        $items = OrderItem::whereIn('order_id', $paidOrderIds)
            ->get(['product_id', 'size_id', 'qty']);

        // Load all relevant recipes with ingredient costs
        $productIds = $items->pluck('product_id')->unique()->all();
        $recipes = Recipe::whereIn('product_id', $productIds)
            ->with('ingredient:id,cost_per_unit')
            ->get()
            ->groupBy(fn ($r) => $r->product_id . '-' . ($r->size_id ?? 0));

        // Calculate COGS: recipe_qty × ingredient_cost × item_qty
        $cogs = 0.0;
        foreach ($items as $item) {
            $key  = $item->product_id . '-' . ($item->size_id ?? 0);
            $keyB = $item->product_id . '-0';
            $rows = $recipes->get($key) ?? $recipes->get($keyB) ?? collect();

            foreach ($rows as $r) {
                if ($r->ingredient && $r->ingredient->cost_per_unit > 0) {
                    $cogs += (float) $r->quantity * (float) $r->ingredient->cost_per_unit * (float) $item->qty;
                }
            }
        }

        return response()->json([
            'revenue'      => round($revenue, 2),
            'cogs'         => round($cogs, 2),
            'profit'       => round($revenue - $cogs, 2),
            'orders_count' => $count,
        ]);
    }

    public function payments(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $query = Order::query();
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

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
