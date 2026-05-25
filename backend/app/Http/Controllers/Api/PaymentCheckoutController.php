<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\OrderUpdated;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentCheckoutController extends Controller
{
    public function initiate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::with(['customer', 'table'])->findOrFail($data['order_id']);

        if ($order->payment_method !== 'KHQR') {
            return response()->json([
                'status' => 'error',
                'message' => 'Order payment method is not KHQR',
            ], 422);
        }

        $transactionId = 'ORD_' . $order->id . '_' . time();
        $amount = number_format($order->total, 2, '.', '');

        $gatewayUrl = config('services.khqr.gateway_url');
        $profileId = config('services.khqr.profile_id');
        $secretKey = config('services.khqr.secret_key');

        $returnUrl = $request->input('return_url');
        $successUrl = url('/khqrpay/return?transaction_id=' . $transactionId . ($returnUrl ? '&return_url=' . urlencode($returnUrl) : ''));
        $remark = 'Order #' . $order->id;

        $rawString = $secretKey
            . $transactionId
            . $amount
            . $successUrl
            . $remark;

        $hash = sha1($rawString);

        $checkoutUrl = $gatewayUrl . '/' . $profileId . '?' . http_build_query([
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'success_url' => $successUrl,
            'remark' => $remark,
            'hash' => $hash,
        ]);

        $order->update([
            'payment_reference' => $transactionId,
        ]);

        return response()->json([
            'status' => 'ok',
            'checkout_url' => $checkoutUrl,
            'transaction_id' => $transactionId,
            'amount' => (float) $amount,
        ]);
    }

    public function callback(Request $request): JsonResponse
    {
        $transactionId = $request->input('transaction_id');

        if (!$transactionId) {
            return response()->json(['status' => 'error', 'message' => 'Missing transaction_id'], 400);
        }

        $order = Order::where('payment_reference', $transactionId)->first();

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
        }

        $order->update([
            'payment_status' => 'Paid',
        ]);

        dispatch_broadcast(new OrderUpdated($order));

        return response()->json([
            'status' => 'completed',
            'message' => 'Payment successful',
            'order_id' => $order->id,
        ]);
    }
}
