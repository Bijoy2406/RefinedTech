<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'product_id',
    ];

    /**
     * Get the buyer that owns the wishlist item
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    /**
     * Get the product that owns the wishlist item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Add product to wishlist
     */
    public static function addToWishlist(int $buyerId, int $productId): bool
    {
        $exists = self::where('buyer_id', $buyerId)
            ->where('product_id', $productId)
            ->exists();

        if (!$exists) {
            self::create([
                'buyer_id' => $buyerId,
                'product_id' => $productId,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Remove product from wishlist
     */
    public static function removeFromWishlist(int $buyerId, int $productId): bool
    {
        return self::where('buyer_id', $buyerId)
            ->where('product_id', $productId)
            ->delete() > 0;
    }

    /**
     * Check if product is in wishlist
     */
    public static function isInWishlist(int $buyerId, int $productId): bool
    {
        return self::where('buyer_id', $buyerId)
            ->where('product_id', $productId)
            ->exists();
    }

    /**
     * Get wishlist with product details
     */
    public static function getWishlistWithProducts(int $buyerId)
    {
        return self::with(['product' => function ($query) {
            $query->select('id', 'title', 'price', 'images', 'condition_grade', 'seller_id', 'status');
        }])
        ->where('buyer_id', $buyerId)
        ->get()
        ->map(function ($wishlistItem) {
            $product = $wishlistItem->product;
            
            // Parse images
            $images = [];
            if ($product->images) {
                $images = json_decode($product->images, true) ?? [];
            }

            return [
                'id' => $wishlistItem->id,
                'product_id' => $product->id,
                'title' => $product->title,
                'price' => $product->price,
                'condition_grade' => $product->condition_grade,
                'seller_id' => $product->seller_id,
                'status' => $product->status,
                'main_image' => $images[0] ?? null,
                'added_at' => $wishlistItem->added_at,
            ];
        });
    }
}