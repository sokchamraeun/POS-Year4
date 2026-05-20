<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KHQR Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h1 class="text-xl font-bold text-gray-800 text-center mb-6">KHQR Test</h1>

        <form method="POST" action="{{ route('khqr.test.generate') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Amount ($)</label>
                <input type="number" name="amount" step="0.01" min="0.01" required
                       class="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="0.00" value="{{ old('amount', $amount ?? '') }}">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                Generate QR
            </button>
        </form>

        @if (isset($error))
        <div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            Error: {{ $error }}
        </div>
        @endif

        @if (isset($qrString))
        <hr class="my-6">
        <div class="text-center">
            <h2 class="text-lg font-semibold text-gray-800 mb-1">Scan to Pay</h2>
            <p class="text-sm text-gray-500 mb-4">KHQR Payment — ${{ number_format($amount, 2) }}</p>
            <div class="inline-block p-4 bg-white rounded-xl border border-gray-200 mb-4">
                <div id="qrcode"></div>
            </div>
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
                document.getElementById('qrcode').innerHTML = '<p class="text-red-500 text-sm">Failed to generate QR</p>';
            }
        </script>
        @endif

        @if (isset($debug))
        <div class="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 text-left overflow-auto max-h-40">
            <pre>{{ $debug }}</pre>
        </div>
        @endif
    </div>
</body>
</html>
