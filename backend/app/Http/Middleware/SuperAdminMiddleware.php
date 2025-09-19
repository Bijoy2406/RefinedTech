<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'Admin') {
            return response()->json(['error' => 'Unauthorized - Admin access required'], 403);
        }

        // Super Admin criteria:
        // 1. First admin (ID = 1)
        // 2. Admin with username 'superadmin'
        // 3. Admin with specific email
        $isSuperAdmin = $user->id === 1 || 
                       $user->admin_username === 'superadmin' ||
                       $user->email === 'admin@refinedtech.com';

        if (!$isSuperAdmin) {
            return response()->json(['error' => 'Super Admin access required'], 403);
        }

        return $next($request);
    }
}
