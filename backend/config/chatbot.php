<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Chatbot Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the RefinedTech chatbot
    |
    */

    // Gemini API settings
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => 'gemini-2.5-flash-lite', // Updated to use working model
        'temperature' => 0.7,
        'top_k' => 40,
        'top_p' => 0.95,
        'max_output_tokens' => 1024,
    ],

    // Chatbot behavior settings
    'behavior' => [
        'max_products_returned' => 5,
        'max_search_results' => 500, // Search through more products before filtering
        'response_timeout' => 30, // seconds
        'enable_product_search' => true,
        'enable_category_info' => true,
        'enable_smart_search' => true, // Use intelligent search ranking
    ],

    // Website information to share with users
    'website_info' => [
        'name' => 'RefinedTech',
        'description' => 'A marketplace for buying and selling refurbished and pre-owned technology products',
        'contact_email' => env('CONTACT_EMAIL', 'support@refinedtech.com'),
        'support_hours' => '9 AM - 6 PM EST, Monday - Friday',
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
        'frontend_url_production' => env('FRONTEND_PRODUCTION_URL', 'https://refinedtech.netlify.app'),
    ],

    // Keywords that trigger product searches
    'product_keywords' => [
        'product', 'buy', 'sell', 'price', 'cost', 'available', 'stock',
        'phone', 'laptop', 'computer', 'tablet', 'smartphone', 'device',
        'apple', 'samsung', 'google', 'dell', 'hp', 'lenovo', 'sony',
        'refurbished', 'used', 'pre-owned', 'condition', 'warranty',
        'iphone', 'ipad', 'macbook', 'android', 'windows', 'galaxy',
        'pixel', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'huawei', 'lg',
        'motorola', 'nokia', 'asus', 'acer', 'monitor', 'headphones',
        'earbuds', 'watch', 'smartwatch', 'gaming', 'ultra', 'pro',
        'plus', 'mini', 'air', 'book', 'pad', 'studio', 'max'
    ],

    // Topics the chatbot should NOT discuss
    'restricted_topics' => [
        'politics', 'religion', 'personal advice', 'medical advice',
        'legal advice', 'financial advice', 'weather', 'news'
    ],
];