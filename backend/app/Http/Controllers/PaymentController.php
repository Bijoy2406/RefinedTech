<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\SSLCommerzService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private $sslcommerzService;

    public function __construct(SSLCommerzService $sslcommerzService)
    {
        $this->sslcommerzService = $sslcommerzService;
    }

    /**
     * Initiate payment with SSLCommerz
     */
    public function initiatePayment(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'order_id' => 'required|exists:orders,id',
            ]);

            $order = Order::with(['buyer', 'orderItems'])->find($request->order_id);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check if user is authorized to pay for this order
            $user = $request->user();
            if ($user && $user->role === 'Buyer') {
                $buyerEmail = $user->email;
                if ($order->buyer->email !== $buyerEmail) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to pay for this order'
                    ], 403);
                }
            }

            // Check if order is payable
            if ($order->payment_status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order payment is already processed or cannot be paid'
                ], 400);
            }

            $paymentResult = $this->sslcommerzService->initiatePayment($order, [
                'name' => $order->buyer->name,
                'email' => $order->buyer->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated successfully',
                'payment_url' => $paymentResult['gateway_page_url'],
                'session_key' => $paymentResult['session_key'],
                'transaction_id' => $paymentResult['transaction_id'],
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initiation error', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle successful payment callback
     */
    public function paymentSuccess(Request $request)
    {
        try {
            Log::info('SSLCommerz Success Callback', $request->all());

            $result = $this->sslcommerzService->handleSuccessfulPayment($request->all());
            
            if ($result['success']) {
                $frontendUrl = config('sslcommerz.frontend_success_url') . 
                    '?order_id=' . $result['order']->id . 
                    '&transaction_id=' . $result['transaction']->transaction_id .
                    '&status=success';
                
                return redirect($frontendUrl);
            } else {
                $frontendUrl = config('sslcommerz.frontend_fail_url') . '?status=validation_failed';
                return redirect($frontendUrl);
            }

        } catch (\Exception $e) {
            Log::error('Payment success handling error', ['error' => $e->getMessage(), 'request' => $request->all()]);
            
            $frontendUrl = config('sslcommerz.frontend_fail_url') . '?status=error';
            return redirect($frontendUrl);
        }
    }

    /**
     * Handle failed payment callback
     */
    public function paymentFail(Request $request)
    {
        try {
            Log::info('SSLCommerz Fail Callback', $request->all());

            $this->sslcommerzService->handleFailedPayment($request->all());
            
            $frontendUrl = config('sslcommerz.frontend_fail_url') . 
                '?transaction_id=' . ($request->tran_id ?? '') . 
                '&status=failed';
            
            return redirect($frontendUrl);

        } catch (\Exception $e) {
            Log::error('Payment fail handling error', ['error' => $e->getMessage(), 'request' => $request->all()]);
            
            $frontendUrl = config('sslcommerz.frontend_fail_url') . '?status=error';
            return redirect($frontendUrl);
        }
    }

    /**
     * Handle cancelled payment callback
     */
    public function paymentCancel(Request $request)
    {
        try {
            Log::info('SSLCommerz Cancel Callback', $request->all());

            $this->sslcommerzService->handleCancelledPayment($request->all());
            
            $frontendUrl = config('sslcommerz.frontend_cancel_url') . 
                '?transaction_id=' . ($request->tran_id ?? '') . 
                '&status=cancelled';
            
            return redirect($frontendUrl);

        } catch (\Exception $e) {
            Log::error('Payment cancel handling error', ['error' => $e->getMessage(), 'request' => $request->all()]);
            
            $frontendUrl = config('sslcommerz.frontend_cancel_url') . '?status=error';
            return redirect($frontendUrl);
        }
    }

    /**
     * Handle IPN (Instant Payment Notification) callback
     */
    public function paymentIPN(Request $request)
    {
        try {
            Log::info('SSLCommerz IPN Callback', $request->all());

            // Process IPN - this is called by SSLCommerz servers
            // You can add additional logic here if needed
            
            return response('IPN Received', 200);

        } catch (\Exception $e) {
            Log::error('IPN handling error', ['error' => $e->getMessage(), 'request' => $request->all()]);
            return response('IPN Error', 500);
        }
    }

    /**
     * Get payment status for an order
     */
    public function getPaymentStatus(Request $request, $orderId): JsonResponse
    {
        try {
            $order = Order::with(['paymentTransactions'])->find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Check authorization
            $user = $request->user();
            if ($user && $user->role === 'Buyer') {
                $buyerEmail = $user->email;
                if ($order->buyer->email !== $buyerEmail) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized to view payment status'
                    ], 403);
                }
            }

            $latestTransaction = $order->paymentTransactions()
                ->where('gateway', 'sslcommerz')
                ->latest()
                ->first();

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'payment_status' => $order->payment_status,
                'order_status' => $order->status,
                'transaction' => $latestTransaction ? [
                    'id' => $latestTransaction->id,
                    'transaction_id' => $latestTransaction->transaction_id,
                    'status' => $latestTransaction->status,
                    'amount' => $latestTransaction->amount,
                    'currency' => $latestTransaction->currency,
                    'created_at' => $latestTransaction->created_at,
                ] : null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving payment status: ' . $e->getMessage()
            ], 500);
        }
    }
}