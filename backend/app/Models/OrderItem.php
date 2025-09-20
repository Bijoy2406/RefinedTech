<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
        'product_title',
        'product_sku',
        'product_condition',
        'product_image_url',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the order that owns the order item
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product that owns the order item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate total price based on quantity and unit price
     */
    public function calculateTotalPrice(): void
    {
        $this->total_price = $this->quantity * $this->unit_price;
        $this->save();
    }

    /**
     * Create order item from product and cart item
     */
    public static function createFromProduct(Product $product, int $quantity = 1): array
    {
        // Get the main product image
        $mainImage = null;
        if ($product->images && is_array(json_decode($product->images, true))) {
            $images = json_decode($product->images, true);
            $mainImage = $images[0] ?? null;
        }

        return [
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit_price' => $product->price,
            'total_price' => $product->price * $quantity,
            'product_title' => $product->title,
            'product_sku' => $product->sku,
            'product_condition' => $product->condition_grade,
            'product_image_url' => $mainImage,
        ];
    }
}