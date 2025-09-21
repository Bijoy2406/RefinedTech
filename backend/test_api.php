<?php

// Test the chatbot API endpoint
$url = 'http://127.0.0.1:8000/api/chatbot';
$data = json_encode(['message' => 'Hello, how are you?']);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

echo "Testing chatbot API endpoint...\n";
echo "URL: $url\n";
echo "Data: $data\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "CURL Error: $error\n";
} else {
    echo "HTTP Code: $httpCode\n";
    echo "Response: $response\n";
    
    if ($httpCode === 200) {
        $responseData = json_decode($response, true);
        if (isset($responseData['success']) && $responseData['success']) {
            echo "\n✅ SUCCESS: Chatbot API is working!\n";
            echo "Bot Response: " . $responseData['response'] . "\n";
        } else {
            echo "\n❌ API returned success=false\n";
        }
    } else {
        echo "\n❌ HTTP Error: $httpCode\n";
    }
}