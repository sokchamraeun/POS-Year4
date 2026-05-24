<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', config('app.name', 'POS'))</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  </head>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
    <div class="flex h-screen">
        <aside class="w-64 bg-white border-r border-gray-200 p-6 relative">
            <h1 class="text-xl font-bold mb-8">
                <a href="{{ route('users.index') }}" class="text-blue-600">POS</a>
            </h1>
            <nav class="space-y-2">
                <a href="{{ route('users.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('users.*') ? 'bg-gray-100 font-semibold' : '' }}">Users</a>
                <a href="{{ route('roles.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('roles.*') ? 'bg-gray-100 font-semibold' : '' }}">Roles</a>
                <a href="{{ route('permissions.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('permissions.*') ? 'bg-gray-100 font-semibold' : '' }}">Permissions</a>
                <a href="{{ route('products.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('products.*') ? 'bg-gray-100 font-semibold' : '' }}">Products</a>
                <a href="{{ route('categories.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('categories.*') ? 'bg-gray-100 font-semibold' : '' }}">Categories</a>
                <a href="{{ route('hero-sliders.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('hero-sliders.*') ? 'bg-gray-100 font-semibold' : '' }}">Hero Sliders</a>
                <a href="{{ route('addons.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('addons.*') ? 'bg-gray-100 font-semibold' : '' }}">Addons</a>
                <a href="{{ route('addon-ingredients.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('addon-ingredients.*') ? 'bg-gray-100 font-semibold' : '' }}">Addon Ingredients</a>
                <a href="{{ route('tables.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('tables.*') ? 'bg-gray-100 font-semibold' : '' }}">Tables</a>
                <a href="{{ route('inventory.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('inventory.*') ? 'bg-gray-100 font-semibold' : '' }}">Inventory</a>
                <a href="{{ route('ingredients.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('ingredients.*') ? 'bg-gray-100 font-semibold' : '' }}">Ingredients</a>
                <a href="{{ route('recipes.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('recipes.*') ? 'bg-gray-100 font-semibold' : '' }}">Recipes</a>
                <a href="{{ route('orders.index') }}" class="block px-4 py-2 rounded hover:bg-gray-100 {{ request()->routeIs('orders.*') ? 'bg-gray-100 font-semibold' : '' }}">Orders</a>
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/staff/menu-order" target="_blank" class="block px-4 py-2 rounded hover:bg-gray-100">Menu Order</a>
                <a href="{{ route('customer.order.form') }}" target="_blank" class="block px-4 py-2 rounded hover:bg-gray-100">Customer Order</a>
                <a href="{{ route('khqr.test') }}" class="block px-4 py-2 rounded hover:bg-gray-100">KHQR Test</a>
            </nav>

            <div class="absolute bottom-6 left-6 right-6">
                <form action="{{ route('auth.logout') }}" method="POST">
                    @csrf
                    <button class="w-full text-left px-4 py-2 rounded hover:bg-gray-100 text-red-600">Logout</button>
                </form>
            </div>
        </aside>

        <main class="flex-1 overflow-y-auto p-8">
            @yield('content')
        </main>
    </div>
</body>
</html>
