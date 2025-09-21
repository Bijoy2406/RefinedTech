<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\PaymentTransaction;
use App\Models\Product;
use App\Models\Buyer;
use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Get all orders for a buyer
     */
    public function getBuyerOrders(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            $orders = Order::with(['orderItems.product', 'seller'])
                ->where('buyer_id', $buyer->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'final_amount' => $order->final_amount,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'payment_method' => $order->payment_method,
                        'tracking_number' => $order->tracking_number,
                        'shipping_carrier' => $order->shipping_carrier,
                        'estimated_delivery_date' => $order->estimated_delivery_date,
                        'created_at' => $order->created_at,
                        'items_count' => $order->orderItems->count(),
                        'seller_name' => $order->seller->name ?? 'Unknown Seller',
                        'items' => $order->orderItems->map(function ($item) {
                            return [
                                'product_title' => $item->product_title,
                                'quantity' => $item->quantity,
                                'unit_price' => $item->unit_price,
                                'total_price' => $item->total_price,
                                'product_image_url' => $item->product_image_url,
                            ];
                        }),
                    ];
                });

            return response()->json([
                'success' => true,
                'orders' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all orders for a seller
     */
    public function getSellerOrders(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Seller') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $seller = Seller::where('email', $user->email)->first();
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller profile not found.'
                ], 404);
            }

            $orders = Order::with(['orderItems.product', 'buyer'])
                ->where('seller_id', $seller->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'final_amount' => $order->final_amount,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'tracking_number' => $order->tracking_number,
                        'shipping_carrier' => $order->shipping_carrier,
                        'created_at' => $order->created_at,
                        'shipping_address' => $order->full_shipping_address,
                        'buyer_name' => $order->buyer->name ?? 'Unknown Buyer',
                        'buyer_phone' => $order->shipping_phone,
                        'items' => $order->orderItems->map(function ($item) {
                            return [
                                'product_title' => $item->product_title,
                                'quantity' => $item->quantity,
                                'unit_price' => $item->unit_price,
                                'total_price' => $item->total_price,
                                'product_image_url' => $item->product_image_url,
                            ];
                        }),
                    ];
                });

            return response()->json([
                'success' => true,
                'orders' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new order from cart or direct purchase
     */
    public function createOrder(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Buyer') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Buyer access required.'
                ], 403);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Buyer profile not found.'
                ], 404);
            }

            // Validate request
            $validator = Validator::make($request->all(), [
                'payment_method' => 'required|in:credit_card,debit_card,paypal,bank_transfer,cash_on_delivery',
                'shipping_address_line1' => 'required|string|max:255',
                'shipping_city' => 'required|string|max:100',
                'shipping_state' => 'required|string|max:100',
                'shipping_postal_code' => 'required|string|max:20',
                'shipping_country' => 'required|string|max:100',
                'shipping_phone' => 'required|string|max:20',
                
                // For direct purchase
                'product_id' => 'nullable|exists:products,id',
                'quantity' => 'nullable|integer|min:1',
                
                // For cart checkout
                'use_cart' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Determine order items
                $orderItems = [];
                $totalAmount = 0;
                $sellerId = null;

                if ($request->product_id) {
                    // Direct purchase
                    $product = Product::find($request->product_id);
                    
                    if (!$product || $product->status !== 'active') {
                        throw new \Exception('Product not available for purchase');
                    }

                    $quantity = $request->quantity ?? 1;
                    
                    if ($quantity > $product->quantity_available) {
                        throw new \Exception('Insufficient product quantity available');
                    }

                    $orderItems[] = OrderItem::createFromProduct($product, $quantity);
                    $totalAmount = $product->price * $quantity;
                    $sellerId = $product->seller_id;

                } elseif ($request->use_cart) {
                    // Cart checkout
                    $cartItems = CartItem::with('product')->where('buyer_id', $buyer->id)->get();
                    
                    if ($cartItems->isEmpty()) {
                        throw new \Exception('Cart is empty');
                    }

                    // Check if all products are from the same seller (for now)
                    $sellerIds = $cartItems->pluck('product.seller_id')->unique();
                    
                    if ($sellerIds->count() > 1) {
                        throw new \Exception('All products must be from the same seller for checkout');
                    }

                    $sellerId = $sellerIds->first();

                    foreach ($cartItems as $cartItem) {
                        if ($cartItem->product->status !== 'active') {
                            throw new \Exception("Product '{$cartItem->product->title}' is no longer available");
                        }

                        if ($cartItem->quantity > $cartItem->product->quantity_available) {
                            throw new \Exception("Insufficient quantity for product '{$cartItem->product->title}'");
                        }

                        $orderItems[] = OrderItem::createFromProduct($cartItem->product, $cartItem->quantity);
                        $totalAmount += $cartItem->product->price * $cartItem->quantity;
                    }
                } else {
                    throw new \Exception('Either product_id or use_cart must be provided');
                }

                // Calculate additional costs (you can customize this)
                $shippingCost = $this->calculateShippingCost($request);
                $taxAmount = $this->calculateTax($totalAmount);
                $finalAmount = $totalAmount + $shippingCost + $taxAmount;

                // Create order
                $order = Order::create([
                    'order_number' => Order::generateOrderNumber(),
                    'buyer_id' => $buyer->id,
                    'seller_id' => $sellerId,
                    'subtotal' => $totalAmount, // Item total before shipping/tax
                    'total_amount' => $totalAmount,
                    'shipping_cost' => $shippingCost,
                    'tax_amount' => $taxAmount,
                    'discount_amount' => 0,
                    'final_amount' => $finalAmount,
                    'shipping_address_line1' => $request->shipping_address_line1,
                    'shipping_address_line2' => $request->shipping_address_line2,
                    'shipping_city' => $request->shipping_city,
                    'shipping_state' => $request->shipping_state,
                    'shipping_postal_code' => $request->shipping_postal_code,
                    'shipping_country' => $request->shipping_country,
                    'shipping_phone' => $request->shipping_phone,
                    'payment_method' => $request->payment_method,
                    'buyer_notes' => $request->buyer_notes,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                ]);

                // Create order items
                foreach ($orderItems as $itemData) {
                    $itemData['order_id'] = $order->id;
                    OrderItem::create($itemData);
                }

                // Update product quantities
                foreach ($orderItems as $itemData) {
                    $product = Product::find($itemData['product_id']);
                    $product->quantity_available -= $itemData['quantity'];
                    
                    if ($product->quantity_available <= 0) {
                        $product->status = 'sold';
                        $product->sold_at = now();
                        $product->sold_to = $buyer->id;
                    }
                    
                    $product->save();
                }

                // Clear cart if it was used
                if ($request->use_cart) {
                    CartItem::where('buyer_id', $buyer->id)->delete();
                }

                // Create payment transaction
                $paymentTransaction = PaymentTransaction::createPayment(
                    $order, 
                    $request->payment_method,
                    $request->payment_gateway
                );

                // Process payment (mock implementation)
                $this->processPayment($paymentTransaction, $request);

                $order->calculateEstimatedDelivery();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'order' => [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'total_amount' => $order->total_amount,
                        'final_amount' => $order->final_amount,
                        'status' => $order->status,
                        'payment_status' => $order->payment_status,
                        'estimated_delivery_date' => $order->estimated_delivery_date,
                    ]
                ], 201);

            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order details
     */
    public function getOrderDetails(Request $request, $orderId): JsonResponse
    {
        try {
            $user = $request->user();
            
            $order = Order::with(['orderItems.product', 'buyer', 'seller', 'paymentTransactions'])
                ->find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check authorization
            $buyer = Buyer::where('email', $user->email)->first();
            $seller = Seller::where('email', $user->email)->first();
            
            $isAuthorized = false;
            if ($buyer && $order->buyer_id === $buyer->id) {
                $isAuthorized = true;
            } elseif ($seller && $order->seller_id === $seller->id) {
                $isAuthorized = true;
            } elseif ($user->role === 'Admin') {
                $isAuthorized = true;
            }

            if (!$isAuthorized) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to view this order'
                ], 403);
            }

            $orderData = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'shipping_cost' => $order->shipping_cost,
                'tax_amount' => $order->tax_amount,
                'final_amount' => $order->final_amount,
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'tracking_number' => $order->tracking_number,
                'shipping_carrier' => $order->shipping_carrier,
                'estimated_delivery_date' => $order->estimated_delivery_date,
                'shipping_address' => [
                    'line1' => $order->shipping_address_line1,
                    'line2' => $order->shipping_address_line2,
                    'city' => $order->shipping_city,
                    'state' => $order->shipping_state,
                    'postal_code' => $order->shipping_postal_code,
                    'country' => $order->shipping_country,
                    'phone' => $order->shipping_phone,
                ],
                'buyer' => [
                    'name' => $order->buyer->name,
                    'email' => $order->buyer->email,
                ],
                'seller' => [
                    'name' => $order->seller->name,
                    'shop_username' => $order->seller->shop_username,
                ],
                'items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product_title' => $item->product_title,
                        'product_sku' => $item->product_sku,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'product_condition' => $item->product_condition,
                        'product_image_url' => $item->product_image_url,
                    ];
                }),
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ];

            return response()->json([
                'success' => true,
                'order' => $orderData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving order details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status (for sellers)
     */
    public function updateOrderStatus(Request $request, $orderId): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || $user->role !== 'Seller') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Seller access required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:confirmed,processing,shipped,delivered',
                'tracking_number' => 'nullable|string|max:100',
                'shipping_carrier' => 'nullable|string|max:100',
                'seller_notes' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $order = Order::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $seller = Seller::where('email', $user->email)->first();
            
            if (!$seller || $order->seller_id !== $seller->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this order'
                ], 403);
            }

            $newStatus = $request->status;

            // Update order based on status
            switch ($newStatus) {
                case 'confirmed':
                    $order->markAsConfirmed();
                    break;
                case 'processing':
                    $order->status = 'processing';
                    break;
                case 'shipped':
                    $order->markAsShipped($request->tracking_number, $request->shipping_carrier);
                    break;
                case 'delivered':
                    $order->markAsDelivered();
                    break;
            }

            if ($request->seller_notes) {
                $order->seller_notes = $request->seller_notes;
            }

            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'tracking_number' => $order->tracking_number,
                    'shipping_carrier' => $order->shipping_carrier,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating order status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel order (for buyers)
     */
    public function cancelOrder(Request $request, $orderId): JsonResponse
    {
        try {
            $user = $request->user();
            
            $order = Order::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            $buyer = Buyer::where('email', $user->email)->first();
            
            if (!$buyer || $order->buyer_id !== $buyer->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to cancel this order'
                ], 403);
            }

            if (!$order->canBeCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order cannot be cancelled in current status'
                ], 400);
            }

            $order->cancel($request->cancellation_reason);

            // Restore product quantities
            foreach ($order->orderItems as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->quantity_available += $item->quantity;
                    if ($product->status === 'sold') {
                        $product->status = 'active';
                        $product->sold_at = null;
                        $product->sold_to = null;
                    }
                    $product->save();
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate shipping cost (customize based on your needs)
     */
    private function calculateShippingCost(Request $request): float
    {
        // Simple flat rate shipping for now
        return 9.99;
    }

    /**
     * Calculate tax (customize based on your needs)
     */
    private function calculateTax(float $amount): float
    {
        // Simple 8% tax rate for now
        return round($amount * 0.08, 2);
    }

    /**
     * Process payment (mock implementation)
     */
    private function processPayment(PaymentTransaction $transaction, Request $request): void
    {
        // This is a mock implementation
        // In a real application, you would integrate with payment gateways like Stripe, PayPal, etc.
        
        try {
            // Simulate payment processing delay
            // sleep(1);

            // For demo purposes, we'll assume payment is successful
            $gatewayResponse = [
                'gateway' => 'mock_gateway',
                'transaction_id' => 'txn_' . uniqid(),
                'status' => 'success',
                'message' => 'Payment processed successfully',
                'processed_at' => now()->toISOString(),
            ];

            $transaction->markAsCompleted(
                $gatewayResponse['transaction_id'],
                $gatewayResponse
            );

            // Update order payment status
            $transaction->order->payment_status = 'paid';
            $transaction->order->payment_reference = $gatewayResponse['transaction_id'];
            $transaction->order->save();

        } catch (\Exception $e) {
            $gatewayResponse = [
                'gateway' => 'mock_gateway',
                'status' => 'failed',
                'error' => $e->getMessage(),
                'processed_at' => now()->toISOString(),
            ];

            $transaction->markAsFailed($gatewayResponse);

            // Update order payment status
            $transaction->order->payment_status = 'failed';
            $transaction->order->save();

            throw new \Exception('Payment processing failed: ' . $e->getMessage());
        }
    }
}