<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class MultiAuthSanctum
{
    /**
     * Attempt to authenticate using any of the sanctum guards for multiple user models.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $guards = ['admin', 'buyer', 'seller', 'sanctum']; // order preference

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Merge the authenticated user into the default auth context
                Auth::setUser(Auth::guard($guard)->user());
                // Sanctum normally updates last_used_at automatically; ensure token touched
                if (method_exists($request->user(), 'currentAccessToken') && $token = $request->user()->currentAccessToken()) {
                    $token->forceFill(['last_used_at' => now()])->save();
                }
                return $next($request);
            }
        }

        return response()->json(['error' => 'Unauthenticated'], 401);
    }
}
