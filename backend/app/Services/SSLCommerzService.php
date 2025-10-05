<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class SSLCommerzService
{
    private $config;
    
    public function __construct()
    {
        $this->config = config('sslcommerz');
    }

    /**
     * Initialize payment session with SSLCommerz
     */
    public function initiatePayment(Order $order, array $customerData = [])
    {
        try {
            $paymentData = [
                'store_id' => $this->config['store_id'],
                'store_passwd' => $this->config['store_password'],
                'total_amount' => $order->final_amount,
                'currency' => $this->config['currency'],
                'tran_id' => $this->generateTransactionId($order),
                'success_url' => $this->config['success_url'],
                'fail_url' => $this->config['fail_url'],
                'cancel_url' => $this->config['cancel_url'],
                'ipn_url' => $this->config['ipn_url'],
                
                // Customer Information
                'cus_name' => $customerData['name'] ?? $order->buyer->name,
                'cus_email' => $customerData['email'] ?? $order->buyer->email,
                'cus_add1' => $order->shipping_address_line1,
                'cus_add2' => $order->shipping_address_line2 ?? '',
                'cus_city' => $order->shipping_city,
                'cus_state' => $order->shipping_state,
                'cus_postcode' => $order->shipping_postal_code,
                'cus_country' => $order->shipping_country,
                'cus_phone' => $order->shipping_phone,
                'cus_fax' => '',
                
                // Shipping Information
                'ship_name' => $customerData['name'] ?? $order->buyer->name,
                'ship_add1' => $order->shipping_address_line1,
                'ship_add2' => $order->shipping_address_line2 ?? '',
                'ship_city' => $order->shipping_city,
                'ship_state' => $order->shipping_state,
                'ship_postcode' => $order->shipping_postal_code,
                'ship_country' => $order->shipping_country,
                'ship_phone' => $order->shipping_phone,
                
                // Product Information
                'product_name' => $this->getProductNames($order),
                'product_category' => 'Electronics',
                'product_profile' => 'physical-goods',
                
                // Additional Parameters
                'value_a' => $order->id, // Store order ID
                'value_b' => $order->buyer_id, // Store buyer ID
                'value_c' => $order->seller_id, // Store seller ID
                'value_d' => '', // Reserved for future use
            ];

            Log::info('SSLCommerz Payment Request', ['data' => $paymentData]);

            $response = Http::asForm()->post($this->config['api_url'], $paymentData);
            
            if ($response->successful()) {
                $responseData = $response->json();
                
                Log::info('SSLCommerz Payment Response', ['response' => $responseData]);
                
                if (isset($responseData['status']) && $responseData['status'] === 'SUCCESS') {
                    // Create payment transaction record with correct transaction ID
                    $this->createPaymentTransaction($order, $paymentData['tran_id'], $responseData);
                    
                    return [
                        'success' => true,
                        'gateway_page_url' => $responseData['GatewayPageURL'],
                        'session_key' => $responseData['sessionkey'],
                        'transaction_id' => $paymentData['tran_id'],
                    ];
                } else {
                    throw new Exception('SSLCommerz API returned error: ' . ($responseData['failedreason'] ?? 'Unknown error'));
                }
            } else {
                throw new Exception('Failed to connect to SSLCommerz API');
            }
            
        } catch (Exception $e) {
            Log::error('SSLCommerz Payment Error', ['error' => $e->getMessage(), 'order_id' => $order->id]);
            throw $e;
        }
    }

    /**
     * Validate payment callback from SSLCommerz
     */
    public function validatePayment($validationId, $amount, $currency = 'BDT')
    {
        try {
            // SSLCommerz validation API expects GET parameters
            $validationUrl = $this->config['validation_url'] . '?' . http_build_query([
                'val_id' => $validationId,
                'store_id' => $this->config['store_id'],
                'store_passwd' => $this->config['store_password'],
                'format' => 'json'
            ]);

            Log::info('SSLCommerz Validation Request', ['url' => $validationUrl, 'val_id' => $validationId]);

            $response = Http::get($validationUrl);  // Changed from POST to GET
            
            if ($response->successful()) {
                $responseData = $response->json();
                Log::info('SSLCommerz Validation Response', ['response' => $responseData]);
                return $responseData;
            } else {
                Log::error('SSLCommerz Validation HTTP Error', ['status' => $response->status(), 'body' => $response->body()]);
                throw new Exception('Failed to validate payment with SSLCommerz');
            }
            
        } catch (Exception $e) {
            Log::error('SSLCommerz Validation Error', ['error' => $e->getMessage(), 'validation_id' => $validationId]);
            throw $e;
        }
    }

    /**
     * Handle successful payment
     */
    public function handleSuccessfulPayment($callbackData)
    {
        try {
            $transactionId = $callbackData['tran_id'];
            $validationId = $callbackData['val_id'];  // Get val_id for validation
            $amount = $callbackData['amount'];
            $currency = $callbackData['currency'];
            
            // Validate the payment using val_id
            $validation = $this->validatePayment($validationId, $amount, $currency);
            
            if (isset($validation['status']) && $validation['status'] === 'VALID') {
                // Find the order using the transaction ID
                $paymentTransaction = PaymentTransaction::where('transaction_id', $transactionId)->first();
                
                if (!$paymentTransaction) {
                    throw new Exception('Payment transaction not found');
                }
                
                $order = Order::find($paymentTransaction->order_id);
                
                if (!$order) {
                    throw new Exception('Order not found');
                }
                
                // Update payment transaction
                $paymentTransaction->update([
                    'status' => 'completed',
                    'gateway_transaction_id' => $callbackData['bank_tran_id'],
                    'gateway_response' => json_encode($callbackData),
                    'processed_at' => now(),
                ]);
                
                // Update order status
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                ]);
                
                Log::info('Payment processed successfully', ['order_id' => $order->id, 'transaction_id' => $transactionId]);
                
                return [
                    'success' => true,
                    'order' => $order,
                    'transaction' => $paymentTransaction,
                ];
            } else {
                throw new Exception('Payment validation failed');
            }
            
        } catch (Exception $e) {
            Log::error('Payment processing error', ['error' => $e->getMessage(), 'callback' => $callbackData]);
            throw $e;
        }
    }

    /**
     * Handle failed payment
     */
    public function handleFailedPayment($callbackData)
    {
        try {
            $transactionId = $callbackData['tran_id'];
            
            // Find the payment transaction
            $paymentTransaction = PaymentTransaction::where('transaction_id', $transactionId)->first();
            
            if ($paymentTransaction) {
                $paymentTransaction->update([
                    'status' => 'failed',
                    'gateway_response' => json_encode($callbackData),
                    'processed_at' => now(),
                ]);
                
                // Update order status
                $order = Order::find($paymentTransaction->order_id);
                if ($order) {
                    $order->update([
                        'payment_status' => 'failed',
                        'status' => 'cancelled',
                    ]);
                }
            }
            
            Log::info('Payment failed', ['transaction_id' => $transactionId]);
            
        } catch (Exception $e) {
            Log::error('Failed payment handling error', ['error' => $e->getMessage(), 'callback' => $callbackData]);
        }
    }

    /**
     * Handle cancelled payment
     */
    public function handleCancelledPayment($callbackData)
    {
        try {
            $transactionId = $callbackData['tran_id'];
            
            // Find the payment transaction
            $paymentTransaction = PaymentTransaction::where('transaction_id', $transactionId)->first();
            
            if ($paymentTransaction) {
                $paymentTransaction->update([
                    'status' => 'cancelled',
                    'gateway_response' => json_encode($callbackData),
                    'processed_at' => now(),
                ]);
                
                // Update order status
                $order = Order::find($paymentTransaction->order_id);
                if ($order) {
                    $order->update([
                        'payment_status' => 'cancelled',
                        'status' => 'cancelled',
                    ]);
                }
            }
            
            Log::info('Payment cancelled', ['transaction_id' => $transactionId]);
            
        } catch (Exception $e) {
            Log::error('Cancelled payment handling error', ['error' => $e->getMessage(), 'callback' => $callbackData]);
        }
    }

    /**
     * Generate unique transaction ID
     */
    private function generateTransactionId(Order $order)
    {
        return 'RT_' . $order->id . '_' . time() . '_' . rand(1000, 9999);
    }

    /**
     * Get product names for the order
     */
    private function getProductNames(Order $order)
    {
        $productNames = $order->orderItems->pluck('product_title')->toArray();
        return implode(', ', $productNames);
    }

    /**
     * Create payment transaction record
     */
    private function createPaymentTransaction(Order $order, $transactionId, array $responseData)
    {
        return PaymentTransaction::create([
            'order_id' => $order->id,
            'transaction_id' => $transactionId,
            'gateway' => 'sslcommerz',
            'payment_method' => 'sslcommerz',
            'amount' => $order->final_amount,
            'currency' => $this->config['currency'],
            'status' => 'pending',
            'gateway_response' => json_encode($responseData),
        ]);
    }
}