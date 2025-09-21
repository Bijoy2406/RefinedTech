<?php

// Test ChatbotService directly
require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the ChatbotService
try {
    $chatbotService = new \App\Services\ChatbotService();
    echo "Testing ChatbotService...\n";
    
    $response = $chatbotService->processMessage('Hello, how are you?');
    
    echo "SUCCESS: ChatbotService is working!\n";
    echo "Response: $response\n";
    
} catch (Exception $e) {
    echo "ERROR: ChatbotService failed\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}