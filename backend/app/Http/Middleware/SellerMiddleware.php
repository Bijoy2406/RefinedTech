<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.'
            ], 401);
        }

        // Check if user is a seller
        if (!($user instanceof \App\Models\Seller)) {
            return response()->json([
                'success' => false,
                'message' => 'Seller access required.'
            ], 403);
        }

        // Check if seller is approved
        if ($user->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Your seller account is pending approval or has been rejected.'
            ], 403);
        }

        return $next($request);
    }
}
