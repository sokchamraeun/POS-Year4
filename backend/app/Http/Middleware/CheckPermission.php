<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string ...$slugs): Response
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return redirect()->route('auth.login');
        }

        foreach ($slugs as $slug) {
            if ($user->hasPermission($slug)) {
                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Forbidden. You do not have the required permission.'], 403);
        }

        return redirect()->back()->with('error', 'You do not have permission to perform this action.');
    }
}
