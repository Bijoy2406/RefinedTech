<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'product_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    /**
     * Get the buyer that owns the cart item
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    /**
     * Get the product that owns the cart item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the total price for this cart item
     */
    public function getTotalPriceAttribute(): float
    {
        return $this->quantity * $this->product->price;
    }

    /**
     * Add product to cart or update quantity
     */
    public static function addToCart(int $buyerId, int $productId, int $quantity = 1): CartItem
    {
        $cartItem = self::where('buyer_id', $buyerId)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            $cartItem = self::create([
                'buyer_id' => $buyerId,
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
        }

        return $cartItem;
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity(int $quantity): void
    {
        if ($quantity <= 0) {
            $this->delete();
        } else {
            $this->quantity = $quantity;
            $this->save();
        }
    }

    /**
     * Get cart items with product details
     */
    public static function getCartWithProducts(int $buyerId)
    {
        return self::with(['product' => function ($query) {
            $query->select('id', 'title', 'price', 'images', 'condition_grade', 'seller_id', 'quantity_available', 'status');
        }])
        ->where('buyer_id', $buyerId)
        ->get()
        ->map(function ($cartItem) {
            $product = $cartItem->product;
            
            // Parse images
            $images = [];
            if ($product->images) {
                $images = json_decode($product->images, true) ?? [];
            }

            return [
                'id' => $cartItem->id,
                'product_id' => $product->id,
                'title' => $product->title,
                'price' => $product->price,
                'quantity' => $cartItem->quantity,
                'total_price' => $cartItem->total_price,
                'condition_grade' => $product->condition_grade,
                'seller_id' => $product->seller_id,
                'quantity_available' => $product->quantity_available,
                'status' => $product->status,
                'main_image' => $images[0] ?? null,
                'added_at' => $cartItem->added_at,
            ];
        });
    }
}