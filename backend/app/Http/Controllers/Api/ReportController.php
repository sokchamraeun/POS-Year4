<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Ingredient;
use App\Models\InventoryTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function saleUsers(): JsonResponse
    {
        $users = User::select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    public function sales(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');
        $saleUser = $request->get('sale_user', 'all');

        $query = Order::query();
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        if ($saleUser !== 'all') {
            $query->where('staff_id', $saleUser);
        }

        $totalSales = (clone $query)->whereIn('payment_status', ['Paid', 'Refunded'])->sum('total');
        $totalOrders = (clone $query)->count();
        $paidOrders = (clone $query)->where('payment_status', 'Paid')->count();
        $unpaidOrders = (clone $query)->where('payment_status', 'Unpaid')->count();
        $refundOrders = (clone $query)->where('payment_status', 'Refunded')->count();
        $avgOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

        $paidAmount = (float) (clone $query)->where('payment_status', 'Paid')->sum('total');
        $unpaidAmount = (float) (clone $query)->where('payment_status', 'Unpaid')->sum('total');
        $refundAmount = (float) (clone $query)->where('payment_status', 'Refunded')->sum('total');
        $totalDiscount = (float) (clone $query)->whereIn('payment_status', ['Paid', 'Refunded'])->sum('discount');

        // Cost of goods sold for the period (paid + refunded orders), computed from recipes.
        $paidOrderIds = (clone $query)->whereIn('payment_status', ['Paid', 'Refunded'])->pluck('id');
        $totalCost = $this->cogsForOrderIds($paidOrderIds);
        $totalProfit = round($totalSales - $totalCost, 2);

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
            ->whereHas('order', function ($q) use ($from, $to, $saleUser) {
                if ($from) {
                    $q->whereDate('created_at', '>=', $from);
                }
                if ($to) {
                    $q->whereDate('created_at', '<=', $to);
                }
                if ($saleUser !== 'all') {
                    $q->where('staff_id', $saleUser);
                }
                $q->whereIn('payment_status', ['Paid', 'Refunded']);
            })
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->with('product:id,name,image')
            ->get();

        return response()->json([
            'total_sales' => round($totalSales, 2),
            'total_orders' => $totalOrders,
            'paid_orders' => $paidOrders,
            'unpaid_orders' => $unpaidOrders,
            'refund_orders' => $refundOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'total_cost' => round($totalCost, 2),
            'total_profit' => $totalProfit,
            'total_discount' => round($totalDiscount, 2),
            'paid_amount' => round($paidAmount, 2),
            'unpaid_amount' => round($unpaidAmount, 2),
            'refund_amount' => round($refundAmount, 2),
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
            ->groupBy(DB::raw("CASE WHEN stock_quantity <= 0 THEN 'Out of Stock' WHEN stock_quantity <= reorder_level THEN 'Low Stock' ELSE 'In Stock' END"))
            ->pluck('count', 'status');

        $items = $ingredients->items();

        return response()->json([
            'ingredients' => $items,
            'pagination' => [
                'current_page' => $ingredients->currentPage(),
                'last_page' => $ingredients->lastPage(),
                'total' => $ingredients->total(),
            ],
            'low_stock' => array_values(array_filter($items, fn ($i) => $i['status'] !== 'In Stock')),
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
        $discount = (float) (clone $query)->sum('discount');
        $refund = (float) (clone $query)->where('payment_status', 'Refunded')->sum('total');

        // Cost of goods sold across the period (paid + refunded orders).
        $orderIds = (clone $query)->pluck('id');
        $cost = $this->cogsForOrderIds($orderIds);
        $grossProfit = round($revenue - $cost, 2);
        $netProfit = round($grossProfit - $refund, 2);
        $margin = $revenue > 0 ? round(($grossProfit / $revenue) * 100, 2) : 0;

        $driver = DB::connection()->getDriverName();
        $monthExpr = match ($driver) {
            'pgsql' => "TO_CHAR(created_at, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', created_at)",
            default => "DATE_FORMAT(created_at, '%Y-%m')",
        };

        // Per-order month + cost so we can show monthly profit without N+1 queries.
        $monthlyOrders = (clone $query)
            ->select('id', DB::raw("{$monthExpr} as month"), 'total', 'discount')
            ->get();
        $costByOrder = $this->cogsByOrder($monthlyOrders->pluck('id')->all());

        $monthly = $monthlyOrders
            ->groupBy('month')
            ->map(function ($rows, $month) use ($costByOrder) {
                $revenue = (float) $rows->sum('total');
                $cost = (float) $rows->sum(fn ($o) => $costByOrder[$o->id] ?? 0);

                return [
                    'month' => $month,
                    'revenue' => round($revenue, 2),
                    'cost' => round($cost, 2),
                    'discount' => round((float) $rows->sum('discount'), 2),
                    'profit' => round($revenue - $cost, 2),
                ];
            })
            ->sortKeys()
            ->values();

        return response()->json([
            'revenue' => round($revenue, 2),
            'cost' => round($cost, 2),
            'discount' => round($discount, 2),
            'refund' => round($refund, 2),
            'gross_profit' => $grossProfit,
            'net_profit' => $netProfit,
            'margin' => $margin,
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

        $guestOrders = Order::whereNull('customer_id')
            ->whereIn('payment_status', ['Paid', 'Refunded'])
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->selectRaw('COUNT(*) as orders_count, COALESCE(SUM(total), 0) as total_spent')
            ->first();

        $totalCustomers = Customer::count();
        $newCustomers = Customer::when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->count();

        if ($guestOrders && $guestOrders->orders_count > 0) {
            $customers->prepend([
                'id' => null,
                'name' => 'Guest',
                'phone' => null,
                'points' => 0,
                'orders_count' => (int) $guestOrders->orders_count,
                'total_spent' => (float) $guestOrders->total_spent,
                'created_at' => null,
            ]);
        }

        return response()->json([
            'customers' => $customers,
            'total_customers' => $totalCustomers + ($guestOrders && $guestOrders->orders_count > 0 ? 1 : 0),
            'new_customers' => $newCustomers,
            'guest_orders_count' => $guestOrders ? (int) $guestOrders->orders_count : 0,
            'guest_total_spent' => $guestOrders ? (float) $guestOrders->total_spent : 0,
        ]);
    }

    public function profitToday(): JsonResponse
    {
        $tz = 'Asia/Phnom_Penh';
        $dayStart = now()->timezone($tz)->startOfDay()->utc()->toDateTimeString();
        $dayEnd = now()->timezone($tz)->endOfDay()->utc()->toDateTimeString();

        // Revenue and order count from paid orders today
        $paidOrderIds = Order::whereBetween('created_at', [$dayStart, $dayEnd])
            ->where('payment_status', 'Paid')
            ->pluck('id');

        $revenue = (float) Order::whereIn('id', $paidOrderIds)->sum('total');
        $count = $paidOrderIds->count();

        // Get all items from paid orders today
        $items = OrderItem::whereIn('order_id', $paidOrderIds)
            ->get(['product_id', 'size_id', 'qty']);

        // Load all relevant recipes with ingredient costs
        $productIds = $items->pluck('product_id')->unique()->all();
        $recipes = Recipe::whereIn('product_id', $productIds)
            ->with('ingredient:id,cost_per_unit')
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.($r->size_id ?? 0));

        // Calculate COGS: recipe_qty × ingredient_cost × item_qty
        $cogs = 0.0;
        foreach ($items as $item) {
            $key = $item->product_id.'-'.($item->size_id ?? 0);
            $keyB = $item->product_id.'-0';
            $rows = $recipes->get($key) ?? $recipes->get($keyB) ?? collect();

            foreach ($rows as $r) {
                if ($r->ingredient && $r->ingredient->cost_per_unit > 0) {
                    $cogs += (float) $r->quantity * (float) $r->ingredient->cost_per_unit * (float) $item->qty;
                }
            }
        }

        return response()->json([
            'revenue' => round($revenue, 2),
            'cogs' => round($cogs, 2),
            'profit' => round($revenue - $cogs, 2),
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
            ->select('payment_status', DB::raw('COUNT(*) as count'), DB::raw('COALESCE(SUM(total), 0) as amount'))
            ->groupBy('payment_status')
            ->get();

        $statusAmount = fn ($status) => (float) (clone $query)->where('payment_status', $status)->sum('total');

        return response()->json([
            'by_method' => $byMethod,
            'by_status' => $byStatus,
            'paid_amount' => round($statusAmount('Paid'), 2),
            'unpaid_amount' => round($statusAmount('Unpaid'), 2),
            'refund_amount' => round($statusAmount('Refunded'), 2),
        ]);
    }

    /**
     * Paginated per-order sales detail with computed cost and profit.
     */
    public function orders(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');
        $search = trim((string) $request->get('search', ''));

        $query = Order::with(['customer:id,name,phone', 'table:id,name', 'staff:id,name'])
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->when($request->get('payment_status'), fn ($q, $v) => $q->where('payment_status', $v))
            ->when($request->get('payment_method'), fn ($q, $v) => $q->where('payment_method', $v))
            ->when($request->get('staff_id'), fn ($q, $v) => $q->where('staff_id', $v))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('id', $search)
                        ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('id');

        $orders = $query->paginate(min((int) $request->get('per_page', 25), 200));

        $ids = collect($orders->items())->pluck('id')->all();
        $costByOrder = $this->cogsByOrder($ids);

        $rows = collect($orders->items())->map(function ($o) use ($costByOrder) {
            $total = (float) $o->total;
            $discount = (float) $o->discount;
            $earns = in_array($o->payment_status, ['Paid', 'Refunded'], true);
            $cost = $earns ? round((float) ($costByOrder[$o->id] ?? 0), 2) : 0.0;

            return [
                'id' => $o->id,
                'created_at' => $o->created_at,
                'customer' => $o->customer?->name ?? 'Guest',
                'staff' => $o->staff?->name ?? '—',
                'table' => $o->table?->name ?? '—',
                'payment_method' => $o->payment_method ?? '—',
                'payment_status' => $o->payment_status ?? '—',
                'status' => $o->status ?? '—',
                'subtotal' => round($total + $discount, 2),
                'discount' => round($discount, 2),
                'total' => round($total, 2),
                'cost' => $cost,
                'profit' => $earns ? round($total - $cost, 2) : 0.0,
            ];
        });

        return response()->json([
            'orders' => $rows,
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Staff / cashier performance, grouped by the staff member who placed the order.
     */
    public function staff(Request $request): JsonResponse
    {
        $from = $request->get('from');
        $to = $request->get('to');

        $rows = Order::query()
            ->whereNotNull('staff_id')
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->select(
                'staff_id',
                DB::raw('COUNT(*) as orders_count'),
                DB::raw("COALESCE(SUM(CASE WHEN payment_status IN ('Paid', 'Refunded') THEN total ELSE 0 END), 0) as revenue"),
                DB::raw('COALESCE(SUM(discount), 0) as total_discount'),
                DB::raw("COALESCE(SUM(CASE WHEN payment_status = 'Refunded' THEN 1 ELSE 0 END), 0) as refund_orders")
            )
            ->groupBy('staff_id')
            ->orderByDesc('revenue')
            ->with('staff:id,name,role_id', 'staff.role:id,name')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->staff_id,
                'name' => $r->staff?->name ?? 'Unknown',
                'role' => $r->staff?->role?->name ?? '—',
                'orders_count' => (int) $r->orders_count,
                'revenue' => round((float) $r->revenue, 2),
                'total_discount' => round((float) $r->total_discount, 2),
                'refund_orders' => (int) $r->refund_orders,
            ]);

        return response()->json([
            'staff' => $rows,
        ]);
    }

    /**
     * Total cost of goods sold for the given order ids (recipe qty × ingredient cost × item qty).
     */
    private function cogsForOrderIds($orderIds): float
    {
        return array_sum($this->cogsByOrder(is_array($orderIds) ? $orderIds : $orderIds->all()));
    }

    /**
     * Cost of goods sold per order id. Returns [order_id => cost].
     */
    private function cogsByOrder(array $orderIds): array
    {
        if (empty($orderIds)) {
            return [];
        }

        $items = OrderItem::whereIn('order_id', $orderIds)->get(['order_id', 'product_id', 'size_id', 'qty']);

        $recipes = Recipe::whereIn('product_id', $items->pluck('product_id')->unique()->all())
            ->with('ingredient:id,cost_per_unit')
            ->get()
            ->groupBy(fn ($r) => $r->product_id.'-'.($r->size_id ?? 0));

        $costByOrder = [];
        foreach ($items as $item) {
            $key = $item->product_id.'-'.($item->size_id ?? 0);
            $rows = $recipes->get($key) ?? $recipes->get($item->product_id.'-0') ?? collect();

            $itemCost = 0.0;
            foreach ($rows as $r) {
                if ($r->ingredient && $r->ingredient->cost_per_unit > 0) {
                    $itemCost += (float) $r->quantity * (float) $r->ingredient->cost_per_unit * (float) $item->qty;
                }
            }

            $costByOrder[$item->order_id] = ($costByOrder[$item->order_id] ?? 0) + $itemCost;
        }

        return $costByOrder;
    }
}
