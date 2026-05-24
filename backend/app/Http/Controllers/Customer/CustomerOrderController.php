<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Table;
use App\Services\SocketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

class CustomerOrderController extends Controller
{
    public function showForm()
    {
        $products = Product::with(['category', 'sizes', 'sugarLevels', 'iceLevels', 'addons'])->where('status', true)->get();
        $tables = Table::where('status', 'available')->get();
        return view('customer.order', compact('products', 'tables'));
    }

    public function placeOrder(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'table_id' => 'nullable|exists:tables,id',
            'items_json' => 'required|json',
        ]);

        $items = json_decode($request->items_json, true);
        $total = collect($items)->sum('subtotal');

        $customerId = null;
        $customerName = 'Guest';
        if (!empty($data['customer_name'])) {
            $customerName = $data['customer_name'];
            $customer = Customer::firstOrCreate(
                ['phone' => $data['phone'] ?? ''],
                ['name' => $customerName]
            );
            $customerId = $customer->id;
        }

        $order = DB::transaction(function () use ($data, $items, $total, $customerId) {
            $order = Order::create([
                'customer_id' => $customerId,
                'table_id' => $data['table_id'] ?? null,
                'total' => $total,
                'payment_method' => 'KHQR',
                'payment_status' => 'Unpaid',
                'status' => 'New',
            ]);

            foreach ($items as $itemData) {
                $item = $order->items()->create([
                    'product_id' => $itemData['product_id'],
                    'size_id' => $itemData['size_id'],
                    'sugar_level_id' => $itemData['sugar_level_id'] ?? null,
                    'ice_level_id' => $itemData['ice_level_id'] ?? null,
                    'qty' => $itemData['qty'] ?? 1,
                    'unit_price' => $itemData['unit_price'] ?? 0,
                    'subtotal' => $itemData['subtotal'] ?? 0,
                ]);

                if (!empty($itemData['addons'])) {
                    foreach ($itemData['addons'] as $addonData) {
                        $item->addons()->create([
                            'addon_id' => $addonData['addon_id'],
                            'price' => $addonData['price'] ?? 0,
                        ]);
                    }
                }
            }

            return $order;
        });

        $transactionId = 'ORD_' . $order->id . '_' . time();

        $individualInfo = new IndividualInfo(
            'sok_chamraeun@bkrt',
            'CHAMRAEUN SOK',
            'PHNOM PENH',
            null,
            null,
            KHQRData::CURRENCY_USD,
            (float) $total,
            null,
            'POS Store',
        );

        $khqrResponse = BakongKHQR::generateIndividual($individualInfo);
        $qrString = null;

        if ($khqrResponse->status['code'] === 0) {
            $qrString = $khqrResponse->data['qr'];
        }

        $order->update([
            'payment_reference' => $transactionId,
        ]);

        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);
        app(SocketService::class)->orderCreated($order->toArray());
        return view('customer.payment', compact('order', 'qrString', 'total', 'customerName'));
    }

    public function confirmation(Request $request, Order $order)
    {
        $secretKey = config('services.khqr.secret_key');

        $successHash = $request->query('success_hash');
        $successTime = $request->query('success_time');
        $successAmount = $request->query('success_amount');

        if ($successHash && $successTime && $successAmount) {
            $expectedHash = hash('sha256', $secretKey . $successTime . $successAmount . 'SUCCESS');
            if ($successHash === $expectedHash) {
                $order->update(['payment_status' => 'Paid']);
            }
        }

        $order->load(['items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon']);
        return view('customer.confirmation', compact('order'));
    }

    public function khqrpayReturn(Request $request)
    {
        $transactionId = $request->query('transaction_id');

        if (!$transactionId) {
            abort(400, 'Missing transaction_id');
        }

        $order = Order::where('payment_reference', $transactionId)->first();

        if (!$order) {
            abort(404, 'Order not found');
        }

        $order->update(['payment_status' => 'Paid']);

        $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);
        app(SocketService::class)->orderUpdated($order->toArray());
        return view('customer.confirmation', compact('order'));
    }

    public function webhook(Request $request): JsonResponse
    {
        $secretKey = config('services.khqr.secret_key');

        $transactionId = $request->input('transaction_id');
        $amount = $request->input('amount');
        $status = $request->input('status');
        $hash = $request->input('hash');
        $reqTime = $request->input('req_time');

        if (!$transactionId || !$hash) {
            return response()->json(['error' => 'Missing required fields'], 400);
        }

        $expectedHash = hash('sha256', $secretKey . $reqTime . $transactionId . $amount . 'SUCCESS');

        if ($hash !== $expectedHash) {
            return response()->json(['error' => 'Invalid hash'], 403);
        }

        $order = Order::where('payment_reference', $transactionId)->first();
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        if ($status === 'SUCCESS') {
            $order->update(['payment_status' => 'Paid']);
            $order->load(['customer', 'table', 'items.product', 'items.size', 'items.sugarLevel', 'items.iceLevel', 'items.addons.addon', 'printedBy']);
            app(SocketService::class)->orderUpdated($order->toArray());
        }

        return response()->json(['status' => 'ok']);
    }
}
