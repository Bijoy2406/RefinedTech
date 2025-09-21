<?php

require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use Illuminate\Support\Facades\Http;

$apiKey = $_ENV['GEMINI_API_KEY'] ?? null;
$model = 'gemini-1.5-flash';
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

echo "Testing Gemini API connection...\n";
echo "API Key: " . ($apiKey ? "Set (length: " . strlen($apiKey) . ")" : "Not set") . "\n";
echo "Model: {$model}\n";
echo "URL: {$apiUrl}\n\n";

if (!$apiKey) {
    echo "ERROR: GEMINI_API_KEY is not set in .env file\n";
    exit(1);
}

// Test the API call
try {
    $response = file_get_contents("$apiUrl?key=$apiKey", false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
            ],
            'content' => json_encode([
                'contents' => [
                    [
                        'parts' => [
                            ['text' => 'Hello, this is a test message. Please respond with "API connection successful"']
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 100,
                ]
            ])
        ]
    ]));

    if ($response === false) {
        echo "ERROR: Failed to connect to Gemini API\n";
        echo "Error: " . error_get_last()['message'] . "\n";
    } else {
        $data = json_decode($response, true);
        
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            echo "SUCCESS: API connection working!\n";
            echo "Response: " . $data['candidates'][0]['content']['parts'][0]['text'] . "\n";
        } else {
            echo "ERROR: Unexpected API response format\n";
            echo "Response: " . $response . "\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: Exception occurred\n";
    echo "Message: " . $e->getMessage() . "\n";
}