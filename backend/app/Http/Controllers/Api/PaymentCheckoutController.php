<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use KHQR\BakongKHQR;
use KHQR\Helpers\KHQRData;
use KHQR\Models\IndividualInfo;

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
        $amount = $order->total;

        $individualInfo = new IndividualInfo(
            'sok_chamraeun@bkrt',
            'CHAMRAEUN SOK',
            'PHNOM PENH',
            null,
            null,
            KHQRData::CURRENCY_USD,
            (float) $amount,
            null,
            'POS Store',
        );

        $khqrResponse = BakongKHQR::generateIndividual($individualInfo);

        if ($khqrResponse->status['code'] !== 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate KHQR: ' . ($khqrResponse->status['message'] ?? 'Unknown error'),
            ], 500);
        }

        $order->update([
            'payment_reference' => $transactionId,
        ]);

        return response()->json([
            'status' => 'ok',
            'qr_string' => $khqrResponse->data['qr'],
            'transaction_id' => $transactionId,
            'amount' => $amount,
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

        return response()->json([
            'status' => 'completed',
            'message' => 'Payment successful',
            'order_id' => $order->id,
        ]);
    }
}
