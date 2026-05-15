@extends('layouts.auth')

@section('title', 'Login')

@section('content')
    <div class="bg-white rounded shadow p-8">
        <h1 class="text-2xl font-bold text-center mb-6">Login</h1>

        @if ($errors->any())
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{{ $errors->first() }}</div>
        @endif

        <form action="{{ route('auth.login.post') }}" method="POST">
            @csrf

            <div class="mb-4">
                <label for="email" class="block font-medium mb-1">Email</label>
                <input type="email" name="email" id="email" value="{{ old('email') }}" class="w-full border rounded px-3 py-2" required autofocus>
            </div>

            <div class="mb-4">
                <label for="password" class="block font-medium mb-1">Password</label>
                <input type="password" name="password" id="password" class="w-full border rounded px-3 py-2" required>
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">Login</button>
        </form>
    </div>
@endsection
