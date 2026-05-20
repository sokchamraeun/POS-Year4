<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order - {{ config('app.name') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Place Your Order</h1>

        <form method="POST" action="{{ route('customer.order.place') }}" id="orderForm">
            @csrf

            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Customer Info</h2>
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <input type="text" name="customer_name" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                        <input type="text" name="phone" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-600 mb-1">Table</label>
                        <select name="table_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">No Table</option>
                            @foreach ($tables as $table)
                                <option value="{{ $table->id }}">{{ $table->name }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Menu</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @foreach ($products as $product)
                    <div class="border border-gray-200 rounded-lg p-4 product-card" data-id="{{ $product->id }}">
                        <div class="flex items-center gap-3 mb-3">
                            @if ($product->image)
                                <img src="{{ $product->image }}" alt="{{ $product->name }}" class="w-12 h-12 rounded-lg object-cover">
                            @else
                                <div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                            @endif
                            <div>
                                <h3 class="font-medium text-gray-800">{{ $product->name }}</h3>
                                <span class="text-xs text-gray-400">{{ $product->category->name ?? '-' }}</span>
                            </div>
                        </div>

                        <input type="hidden" name="items[{{ $product->id }}][product_id]" value="{{ $product->id }}">

                        <div class="space-y-2 text-sm">
                            <div>
                                <label class="text-gray-500 text-xs">Size</label>
                                <select name="items[{{ $product->id }}][size_id]" class="size-select w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm mt-1">
                                    @foreach ($product->sizes as $size)
                                        <option value="{{ $size->id }}" data-price="{{ $size->pivot->price ?? 0 }}">{{ $size->name }} - ${{ number_format($size->pivot->price ?? 0, 2) }}</option>
                                    @endforeach
                                </select>
                            </div>

                            @if ($product->sugarLevels->count())
                            <div>
                                <label class="text-gray-500 text-xs">Sugar</label>
                                <select name="items[{{ $product->id }}][sugar_level_id]" class="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm mt-1">
                                    @foreach ($product->sugarLevels as $level)
                                        <option value="{{ $level->id }}">{{ $level->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                            @endif

                            @if ($product->iceLevels->count())
                            <div>
                                <label class="text-gray-500 text-xs">Ice</label>
                                <select name="items[{{ $product->id }}][ice_level_id]" class="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm mt-1">
                                    @foreach ($product->iceLevels as $level)
                                        <option value="{{ $level->id }}">{{ $level->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                            @endif

                            @if ($product->addons->count())
                            <div>
                                <label class="text-gray-500 text-xs">Addon</label>
                                <select name="items[{{ $product->id }}][addon_id]" class="addon-select w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm mt-1">
                                    <option value="">None</option>
                                    @foreach ($product->addons as $addon)
                                        <option value="{{ $addon->id }}" data-price="{{ $addon->pivot->price ?? $addon->price ?? 0 }}">{{ $addon->name }} (+${{ number_format($addon->pivot->price ?? $addon->price ?? 0, 2) }})</option>
                                    @endforeach
                                </select>
                            </div>
                            @endif

                            <div class="flex items-center gap-3 pt-2">
                                <label class="text-gray-500 text-xs">Qty</label>
                                <input type="number" name="items[{{ $product->id }}][qty]" value="0" min="0" class="qty-input w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center">
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
                <div class="text-right text-2xl font-bold text-gray-800">
                    Total: $<span id="totalDisplay">0.00</span>
                </div>
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors">
                Place Order — Pay with KHQR
            </button>
        </form>
    </div>

    <script>
        const products = @json($products);

        document.querySelectorAll('.product-card').forEach(card => {
            const sizeSelect = card.querySelector('.size-select');
            const addonSelect = card.querySelector('.addon-select');
            const qtyInput = card.querySelector('.qty-input');

            function updateTotal() {
                let total = 0;
                document.querySelectorAll('.product-card').forEach(c => {
                    const qty = parseInt(c.querySelector('.qty-input').value) || 0;
                    if (qty === 0) return;
                    const sizePrice = parseFloat(c.querySelector('.size-select option:checked').dataset.price) || 0;
                    const addonPrice = parseFloat(c.querySelector('.addon-select option:checked')?.dataset?.price) || 0;
                    total += (sizePrice + addonPrice) * qty;
                });
                document.getElementById('totalDisplay').textContent = total.toFixed(2);
            }

            sizeSelect?.addEventListener('change', updateTotal);
            addonSelect?.addEventListener('change', updateTotal);
            qtyInput?.addEventListener('input', updateTotal);
        });

        document.getElementById('orderForm').addEventListener('submit', function(e) {
            const items = {};
            document.querySelectorAll('.product-card').forEach(card => {
                const qty = parseInt(card.querySelector('.qty-input').value) || 0;
                if (qty === 0) return;
                const pid = card.dataset.id;
                const sizeId = parseInt(card.querySelector('.size-select').value);
                const sugarId = parseInt(card.querySelector('[name$="[sugar_level_id]"]')?.value) || null;
                const iceId = parseInt(card.querySelector('[name$="[ice_level_id]"]')?.value) || null;
                const addonId = parseInt(card.querySelector('.addon-select')?.value) || null;
                const sizePrice = parseFloat(card.querySelector('.size-select option:checked').dataset.price) || 0;
                const addonPrice = parseFloat(card.querySelector('.addon-select option:checked')?.dataset?.price) || 0;
                const unitPrice = sizePrice + addonPrice;

                items[pid] = {
                    product_id: parseInt(pid),
                    size_id: sizeId,
                    sugar_level_id: sugarId,
                    ice_level_id: iceId,
                    qty: qty,
                    unit_price: unitPrice,
                    subtotal: unitPrice * qty,
                    addons: addonId ? [{ addon_id: addonId, price: addonPrice }] : [],
                };
            });

            if (Object.keys(items).length === 0) {
                e.preventDefault();
                alert('Please add at least one item.');
                return;
            }

            const form = this;
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'items_json';
            input.value = JSON.stringify(Object.values(items));
            form.appendChild(input);
        });
    </script>
</body>
</html>
