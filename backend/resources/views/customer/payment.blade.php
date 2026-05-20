<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scan to Pay - {{ config('app.name') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
        </div>

        <h1 class="text-xl font-bold text-gray-800 mb-1">Scan to Pay</h1>
        <p class="text-sm text-gray-500 mb-6">KHQR Payment</p>

        <div class="inline-block p-4 bg-white rounded-xl border border-gray-200 mb-4">
            <div id="qrcode"></div>
        </div>

        <div class="space-y-2 text-sm text-gray-600 mb-6">
            <p>Customer: <span class="font-medium text-gray-800">{{ $customerName }}</span></p>
            <p>Order: <span class="font-medium text-gray-800">#{{ $order->id }}</span></p>
            @if ($order->table)
                <p>Table: <span class="font-medium text-gray-800">{{ $order->table->name }}</span></p>
            @endif
            <p>Amount: <span class="font-medium text-gray-800 text-lg">${{ number_format($total, 2) }}</span></p>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700 mb-6">
            Scan the QR code with your banking app to pay. After payment, you will be redirected automatically.
        </div>

        <a href="{{ route('customer.order.confirmation', $order->id) }}"
           class="inline-block w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            I've Paid — Check Status
        </a>
    </div>

    <script>
        try {
            new QRCode(document.getElementById('qrcode'), {
                text: {!! json_encode($qrString) !!},
                width: 250,
                height: 250,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (e) {
            document.getElementById('qrcode').innerHTML = '<p class="text-red-500 text-sm">Failed to generate QR code</p>';
        }
    </script>
</body>
</html>
