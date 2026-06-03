<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('role', 'loginHistories');

        if ($request->type === 'customer') {
            $query->whereDoesntHave('role', function ($q) {
                $q->whereIn('slug', ['admin', 'manage', 'staff']);
            })->orWhereNull('role_id');
        }

        $users = $query->orderBy('id')->paginate(1000);

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('role', 'loginHistories');

        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:30',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:30',
            'role_id' => 'nullable|exists:roles,id',
            'status' => 'boolean',
            'last_login_at' => 'nullable|date',
            'logout_at' => 'nullable|date',
        ]);

        if (array_key_exists('last_login_at', $data) && is_null($data['last_login_at'])) {
            $user->last_login_at = null;
        } elseif (array_key_exists('last_login_at', $data)) {
            $user->last_login_at = $data['last_login_at'];
        }
        if (array_key_exists('logout_at', $data) && is_null($data['logout_at'])) {
            $user->logout_at = null;
        } elseif (array_key_exists('logout_at', $data)) {
            $user->logout_at = $data['logout_at'];
        }

        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
