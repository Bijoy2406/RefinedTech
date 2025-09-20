<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\ChatbotService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ChatbotTest extends TestCase
{
    /**
     * Test chatbot API endpoint
     */
    public function test_chatbot_endpoint_responds()
    {
        $response = $this->postJson('/api/chatbot', [
            'message' => 'What is RefinedTech?'
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'response',
                     'timestamp'
                 ]);
    }

    /**
     * Test chatbot service context preparation
     */
    public function test_chatbot_service_prepares_context()
    {
        $service = new ChatbotService();
        
        // Use reflection to test private method
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('prepareContext');
        $method->setAccessible(true);
        
        $context = $method->invoke($service, 'What products do you have?');
        
        $this->assertArrayHasKey('website_info', $context);
        $this->assertArrayHasKey('products', $context);
        $this->assertArrayHasKey('categories', $context);
    }

    /**
     * Test product query detection
     */
    public function test_product_query_detection()
    {
        $service = new ChatbotService();
        
        // Use reflection to test private method
        $reflection = new \ReflectionClass($service);
        $method = $reflection->getMethod('isProductQuery');
        $method->setAccessible(true);
        
        $this->assertTrue($method->invoke($service, 'Do you have any smartphones?'));
        $this->assertTrue($method->invoke($service, 'What laptops are available?'));
        $this->assertFalse($method->invoke($service, 'What is the weather?'));
    }

    /**
     * Test validation on chatbot endpoint
     */
    public function test_chatbot_validates_input()
    {
        $response = $this->postJson('/api/chatbot', []);
        
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['message']);
    }
}