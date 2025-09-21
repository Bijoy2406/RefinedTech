<?php

// Simple test to check if CloudinaryService can be loaded
require_once __DIR__ . '/vendor/autoload.php';

use App\Services\CloudinaryService;

try {
    $service = new CloudinaryService();
    echo "CloudinaryService loaded successfully!\n";
    echo "Environment: " . config('app.env', 'unknown') . "\n";
} catch (Exception $e) {
    echo "Error loading CloudinaryService: " . $e->getMessage() . "\n";
}