<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:30',
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('role.permissions'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $user->update(['last_login_at' => now(), 'logout_at' => null]);

        LoginHistory::create([
            'user_id' => $user->id,
            'login_at' => now(),
            'ip_address' => $request->ip(),
            'device' => $request->userAgent(),
            'status' => 'active',
        ]);

        return response()->json([
            'user' => $user->load('role.permissions'),
            'token' => $token,
            'must_change_password' => $user->must_change_password,
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|different:current_password',
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update([
            'password' => bcrypt($data['new_password']),
            'must_change_password' => false,
        ]);

        $user->tokens()->delete();
        $newToken = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Password changed successfully. Please log in again.',
            'token' => $newToken,
            'user' => $user->load('role.permissions'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update(['logout_at' => now()]);

        LoginHistory::where('user_id', $user->id)
            ->whereNull('logout_at')
            ->latest('login_at')
            ->first()
            ?->update(['logout_at' => now(), 'status' => 'logged_out']);

        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('role.permissions'));
    }
}
