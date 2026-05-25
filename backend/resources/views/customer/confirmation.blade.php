<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - {{ config('app.name') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    @if ($returnUrl)
    <script>
        setTimeout(() => { window.location.href = '{{ $returnUrl }}'; }, 3000);
    </script>
    @endif
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-xl p-8 text-center max-w-lg w-full mx-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
        </div>

        <h1 class="text-xl font-bold text-gray-800 mb-1">Order Confirmed!</h1>
        <p class="text-sm text-gray-500 mb-6">Thank you for your order</p>

        <div class="bg-gray-50 rounded-xl p-6 text-left space-y-3 mb-6">
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Customer</span>
                <span class="font-medium text-gray-800">{{ $order->customer->name ?? 'Guest' }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Order #</span>
                <span class="font-medium text-gray-800">{{ $order->id }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Status</span>
                <span class="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">{{ ucfirst($order->status) }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Payment</span>
                <span class="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">{{ $order->payment_status }}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total</span>
                <span class="font-bold text-lg text-gray-800">${{ number_format($order->total, 2) }}</span>
            </div>
        </div>

        <div class="border-t border-gray-200 pt-4 mb-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-3 text-left">Items</h3>
            @foreach ($order->items as $item)
            <div class="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                <div class="text-left">
                    <span class="text-gray-800 font-medium">{{ $item->product->name }}</span>
                    <div class="text-xs text-gray-400">
                        {{ $item->size->name ?? '' }}
                        @if ($item->sugarLevel) | {{ $item->sugarLevel->name }} @endif
                        @if ($item->iceLevel) | {{ $item->iceLevel->name }} @endif
                        @foreach ($item->addons as $a) | {{ $a->addon->name }} @endforeach
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-gray-800">x{{ $item->qty }}</span>
                    <span class="text-gray-600 ml-3">${{ number_format($item->subtotal, 2) }}</span>
                </div>
            </div>
            @endforeach
        </div>

        <p class="text-xs text-gray-400">Your order is being prepared. Show this confirmation to the staff.</p>
    </div>
</body>
</html>
