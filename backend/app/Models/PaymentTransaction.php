<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_type',
        'amount',
        'currency',
        'payment_method',
        'payment_gateway',
        'gateway_transaction_id',
        'gateway_response',
        'status',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
        'gateway_response' => 'json',
    ];

    /**
     * Get the order that owns the payment transaction
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Mark transaction as completed
     */
    public function markAsCompleted(string $gatewayTransactionId = null, array $gatewayResponse = null): void
    {
        $this->status = 'completed';
        $this->processed_at = now();
        
        if ($gatewayTransactionId) {
            $this->gateway_transaction_id = $gatewayTransactionId;
        }
        
        if ($gatewayResponse) {
            $this->gateway_response = $gatewayResponse;
        }
        
        $this->save();
    }

    /**
     * Mark transaction as failed
     */
    public function markAsFailed(array $gatewayResponse = null): void
    {
        $this->status = 'failed';
        $this->processed_at = now();
        
        if ($gatewayResponse) {
            $this->gateway_response = $gatewayResponse;
        }
        
        $this->save();
    }

    /**
     * Create a payment transaction
     */
    public static function createPayment(Order $order, string $paymentMethod, string $paymentGateway = null): PaymentTransaction
    {
        return self::create([
            'order_id' => $order->id,
            'transaction_type' => 'payment',
            'amount' => $order->final_amount,
            'currency' => 'USD',
            'payment_method' => $paymentMethod,
            'payment_gateway' => $paymentGateway,
            'status' => 'pending',
        ]);
    }

    /**
     * Create a refund transaction
     */
    public static function createRefund(Order $order, float $amount = null): PaymentTransaction
    {
        $refundAmount = $amount ?? $order->final_amount;
        $transactionType = $refundAmount < $order->final_amount ? 'partial_refund' : 'refund';

        return self::create([
            'order_id' => $order->id,
            'transaction_type' => $transactionType,
            'amount' => $refundAmount,
            'currency' => 'USD',
            'payment_method' => $order->payment_method,
            'payment_gateway' => $order->payment_gateway,
            'status' => 'pending',
        ]);
    }
}