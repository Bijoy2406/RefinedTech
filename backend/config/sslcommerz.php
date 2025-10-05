<?php

return [
    // SSLCommerz configuration for demo
    'project_name' => env('SSLCOMMERZ_PROJECT_NAME', 'RefinedTech'),
    'store_id' => env('SSLCOMMERZ_STORE_ID', 'testbox'),
    'store_password' => env('SSLCOMMERZ_STORE_PASSWORD', 'qwerty'),
    'currency' => env('SSLCOMMERZ_CURRENCY', 'BDT'),
    'sandbox' => env('SSLCOMMERZ_SANDBOX', true), // Set to false for production
    
    // URLs
    'success_url' => env('APP_URL', 'http://127.0.0.1:8000') . '/api/payment/sslcommerz/success',
    'fail_url' => env('APP_URL', 'http://127.0.0.1:8000') . '/api/payment/sslcommerz/fail',
    'cancel_url' => env('APP_URL', 'http://127.0.0.1:8000') . '/api/payment/sslcommerz/cancel',
    'ipn_url' => env('APP_URL', 'http://127.0.0.1:8000') . '/api/payment/sslcommerz/ipn',
    
    // Frontend URLs
    'frontend_success_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/success',
    'frontend_fail_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/fail',
    'frontend_cancel_url' => env('FRONTEND_URL', 'http://localhost:5173') . '/payment/cancel',
    
    // SSLCommerz API URLs
    'api_url' => env('SSLCOMMERZ_SANDBOX', true) 
        ? 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php'
        : 'https://securepay.sslcommerz.com/gwprocess/v3/api.php',
    
    'validation_url' => env('SSLCOMMERZ_SANDBOX', true)
        ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
        : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php',
];