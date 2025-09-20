<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

<<<<<<< HEAD
        // Define allowed origins
        $allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174', 
            'http://localhost:3000',
            'https://refinedtech.netlify.app',
            // Add Railway preview domains pattern
            'https://*.up.railway.app'
        ];

        $origin = $request->headers->get('Origin');
        
        // Check if the origin is allowed or matches Railway pattern
        $isAllowed = in_array($origin, $allowedOrigins) || 
                    (str_contains($origin, '.up.railway.app') && str_starts_with($origin, 'https://'));
        
        if ($isAllowed) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
        }

=======
        $response->headers->set('Access-Control-Allow-Origin', '*');
>>>>>>> dev
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(200);
        }

        return $response;
    }
}
