<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderUpdated;
use App\Http\Controllers\Controller;
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

        $transactionId = 'ORD_'.$order->id.'_'.time();
        $amount = number_format($order->total, 2, '.', '');

        $gatewayUrl = config('services.khqr.gateway_url');
        $profileId = config('services.khqr.profile_id');
        $secretKey = config('services.khqr.secret_key');

        // Point the success URL at our backend callback so the payment is
        // marked Paid automatically when khqr.cc redirects after payment.
        $backendUrl = rtrim(config('app.url'), '/');
        $returnUrl = $request->input('return_url');
        $successUrl = $backendUrl.'/api/orders/payment/callback?transaction_id='.$transactionId.($returnUrl ? '&return_url='.urlencode($returnUrl) : '');
        $remark = 'Order #'.$order->id;

        $rawString = $secretKey
            .$transactionId
            .$amount
            .$successUrl
            .$remark;

        $hash = sha1($rawString);

        $checkoutUrl = $gatewayUrl.'/'.$profileId.'?'.http_build_query([
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

    public function callback(Request $request)
    {
        $transactionId = $request->input('transaction_id');

        if (! $transactionId) {
            return $request->expectsJson()
                ? response()->json(['status' => 'error', 'message' => 'Missing transaction_id'], 400)
                : $this->resultPage(false, 'Missing transaction reference');
        }

        $order = Order::where('payment_reference', $transactionId)->first();

        if (! $order) {
            return $request->expectsJson()
                ? response()->json(['status' => 'error', 'message' => 'Order not found'], 404)
                : $this->resultPage(false, 'Order not found');
        }

        if (strtolower((string) $order->payment_status) !== 'paid') {
            $order->update([
                'payment_status' => 'Paid',
            ]);

            dispatch_broadcast(new OrderUpdated($order));
        }

        if ($request->expectsJson()) {
            return response()->json([
                'status' => 'completed',
                'message' => 'Payment successful',
                'order_id' => $order->id,
            ]);
        }

        // Browser navigation (the embedded iframe lands here after payment):
        // show a success page that notifies the parent window so it can
        // redirect to the receipt.
        return $this->resultPage(true, 'Order #'.$order->id, $request->input('return_url'));
    }

    private function resultPage(bool $success, string $message, ?string $returnUrl = null)
    {
        $title = $success ? 'Payment Successful' : 'Payment Error';
        $color = $success ? '#059669' : '#dc2626';
        $icon = $success ? '&#10003;' : '&#10005;';
        $escapedMsg = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        $type = $success ? 'khqr-paid' : 'khqr-error';
        $returnJs = $returnUrl ? 'setTimeout(function(){location.href='.json_encode($returnUrl).';},2500);' : '';

        return response(
            <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{$title}</title>
<style>
  body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;color:#374151}
  .box{text-align:center;padding:2rem}
  .icon{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:38px;color:#fff;background:{$color}}
  h2{margin:0 0 .25rem;color:{$color}}
  p{color:#6b7280;font-size:14px;margin:0}
</style>
</head>
<body>
  <div class="box">
    <div class="icon">{$icon}</div>
    <h2>{$title}</h2>
    <p>{$escapedMsg}</p>
  </div>
  <script>
    try { if (window.parent && window.parent !== window) window.parent.postMessage('{$type}', '*'); } catch (e) {}
    {$returnJs}
  </script>
</body>
</html>
HTML,
            200,
            ['Content-Type' => 'text/html; charset=utf-8']
        );
    }
}
