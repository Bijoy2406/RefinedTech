<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'buyer_id',
        'seller_id',
        'subtotal',
        'total_amount',
        'shipping_cost',
        'tax_amount',
        'discount_amount',
        'final_amount',
        'shipping_address_line1',
        'shipping_address_line2',
        'shipping_city',
        'shipping_state',
        'shipping_postal_code',
        'shipping_country',
        'shipping_phone',
        'billing_address_line1',
        'billing_address_line2',
        'billing_city',
        'billing_state',
        'billing_postal_code',
        'billing_country',
        'billing_phone',
        'status',
        'payment_status',
        'payment_method',
        'payment_reference',
        'payment_gateway',
        'transaction_id',
        'tracking_number',
        'shipping_carrier',
        'estimated_delivery_date',
        'actual_delivery_date',
        'buyer_notes',
        'seller_notes',
        'admin_notes',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'estimated_delivery_date' => 'date',
        'actual_delivery_date' => 'date',
        'confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Boot method to add model events
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically populate the old shipping_address field when creating/updating
        static::saving(function ($order) {
            if ($order->shipping_address_line1) {
                $address = $order->shipping_address_line1;
                if ($order->shipping_address_line2) {
                    $address .= ', ' . $order->shipping_address_line2;
                }
                $address .= ', ' . $order->shipping_city . ', ' . $order->shipping_state;
                $address .= ' ' . $order->shipping_postal_code . ', ' . $order->shipping_country;
                
                $order->shipping_address = $address;
            }
        });
    }

    /**
     * Generate a unique order number
     */
    public static function generateOrderNumber()
    {
        do {
            $orderNumber = 'RT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        } while (self::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Get the buyer that owns the order
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    /**
     * Get the seller that owns the order
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    /**
     * Get the order items for the order
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the payment transactions for the order
     */
    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'delivered';
    }

    /**
     * Get the full shipping address
     */
    public function getFullShippingAddressAttribute(): string
    {
        $address = $this->shipping_address_line1;
        if ($this->shipping_address_line2) {
            $address .= ', ' . $this->shipping_address_line2;
        }
        $address .= ', ' . $this->shipping_city . ', ' . $this->shipping_state;
        $address .= ' ' . $this->shipping_postal_code . ', ' . $this->shipping_country;
        
        return $address;
    }

    /**
     * Calculate estimated delivery date
     */
    public function calculateEstimatedDelivery($days = 7): void
    {
        $this->estimated_delivery_date = now()->addDays($days)->toDateString();
        $this->save();
    }

    /**
     * Mark order as confirmed
     */
    public function markAsConfirmed(): void
    {
        $this->status = 'confirmed';
        $this->confirmed_at = now();
        $this->save();
    }

    /**
     * Mark order as shipped
     */
    public function markAsShipped(string $trackingNumber = null, string $carrier = null): void
    {
        $this->status = 'shipped';
        $this->shipped_at = now();
        
        if ($trackingNumber) {
            $this->tracking_number = $trackingNumber;
        }
        
        if ($carrier) {
            $this->shipping_carrier = $carrier;
        }
        
        $this->save();
    }

    /**
     * Mark order as delivered
     */
    public function markAsDelivered(): void
    {
        $this->status = 'delivered';
        $this->delivered_at = now();
        $this->actual_delivery_date = now()->toDateString();
        $this->save();
    }

    /**
     * Cancel the order
     */
    public function cancel(string $reason = null): void
    {
        if (!$this->canBeCancelled()) {
            throw new \Exception('Order cannot be cancelled in current status');
        }

        $this->status = 'cancelled';
        $this->cancelled_at = now();
        
        if ($reason) {
            $this->admin_notes = $reason;
        }
        
        $this->save();
    }
}