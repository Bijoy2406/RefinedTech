<?php

// Test the chatbot API endpoint with a product query
$url = 'http://127.0.0.1:8000/api/chatbot';
$data = json_encode(['message' => 'show me some laptops']);

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

echo "Testing chatbot with product query...\n";
echo "Query: 'show me some laptops'\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    if (isset($responseData['success']) && $responseData['success']) {
        echo "✅ Product query working!\n\n";
        echo "Bot Response:\n" . $responseData['response'] . "\n";
    }
} else {
    echo "❌ Error: $httpCode\n";
}