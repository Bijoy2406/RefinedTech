<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'title',
        'description',
        'category',
        'subcategory',
        'brand',
        'model',
        'sku',
        'condition_grade',
        'condition_description',
        'price',
        'original_price',
        'discount_percentage',
        'quantity_available',
        'warranty_period',
        'return_policy',
        'shipping_weight',
        'dimensions',
        'color',
        'storage_capacity',
        'ram_memory',
        'processor',
        'operating_system',
        'battery_health',
        'screen_size',
        'connectivity',
        'included_accessories',
        'defects_issues',
        'purchase_date',
        'usage_duration',
        'reason_for_selling',
        'tags',
        'images',
        'is_featured',
        'is_urgent_sale',
        'negotiable',
        'minimum_price',
        'location_city',
        'location_state',
        'shipping_options',
        'status',
<<<<<<< HEAD
        'sold_at',
        'sold_to',
=======
>>>>>>> dev
        'approval_date',
        'rejection_reason',
        'views_count',
        'favorites_count'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'minimum_price' => 'decimal:2',
        'quantity_available' => 'integer',
        'is_featured' => 'boolean',
        'is_urgent_sale' => 'boolean',
        'negotiable' => 'boolean',
        'views_count' => 'integer',
        'favorites_count' => 'integer',
        'purchase_date' => 'date',
<<<<<<< HEAD
        'approval_date' => 'datetime',
        'sold_at' => 'datetime',
        'sold_to' => 'integer'
=======
        'approval_date' => 'datetime'
>>>>>>> dev
    ];

    protected $attributes = [
        'status' => 'active',
        'views_count' => 0,
        'favorites_count' => 0,
        'quantity_available' => 1,
        'is_featured' => false,
        'is_urgent_sale' => false,
        'negotiable' => true
    ];

    /**
     * Get the seller that owns the product
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    /**
     * Get the product images
     */
    public function productImages(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Scope a query to only include active products
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include pending products
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include featured products
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include urgent sale products
     */
    public function scopeUrgentSale($query)
    {
        return $query->where('is_urgent_sale', true);
    }

    /**
     * Scope a query to filter by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to filter by condition grade
     */
    public function scopeByCondition($query, $condition)
    {
        return $query->where('condition_grade', $condition);
    }

    /**
     * Scope a query to filter by price range
     */
    public function scopePriceRange($query, $minPrice = null, $maxPrice = null)
    {
        if ($minPrice !== null) {
            $query->where('price', '>=', $minPrice);
        }
        
        if ($maxPrice !== null) {
            $query->where('price', '<=', $maxPrice);
        }
        
        return $query;
    }

    /**
     * Search products by title, description, brand, or model
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', '%' . $search . '%')
              ->orWhere('description', 'LIKE', '%' . $search . '%')
              ->orWhere('brand', 'LIKE', '%' . $search . '%')
              ->orWhere('model', 'LIKE', '%' . $search . '%')
              ->orWhere('tags', 'LIKE', '%' . $search . '%');
        });
    }

    /**
     * Get the formatted price with currency
     */
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    /**
     * Get the formatted original price with currency
     */
    public function getFormattedOriginalPriceAttribute()
    {
        return $this->original_price ? '$' . number_format($this->original_price, 2) : null;
    }

    /**
     * Get the savings amount
     */
    public function getSavingsAttribute()
    {
        if ($this->original_price && $this->original_price > $this->price) {
            return $this->original_price - $this->price;
        }
        return 0;
    }

    /**
     * Get the formatted savings with currency
     */
    public function getFormattedSavingsAttribute()
    {
        $savings = $this->savings;
        return $savings > 0 ? '$' . number_format($savings, 2) : null;
    }

    /**
     * Check if the product is available for purchase
     */
    public function getIsAvailableAttribute()
    {
        return $this->status === 'active' && $this->quantity_available > 0;
    }

    /**
     * Get the condition label with emoji
     */
    public function getConditionLabelAttribute()
    {
        $labels = [
            'like-new' => 'Like New ⭐',
            'excellent' => 'Excellent ✨',
            'good' => 'Good 👍',
            'fair' => 'Fair 👌'
        ];

        return $labels[$this->condition_grade] ?? ucfirst(str_replace('-', ' ', $this->condition_grade));
    }

    /**
     * Get the status badge color
     */
    public function getStatusColorAttribute()
    {
        $colors = [
            'active' => 'success',
            'pending' => 'warning',
            'rejected' => 'danger',
            'sold' => 'secondary',
            'draft' => 'info'
        ];

        return $colors[$this->status] ?? 'secondary';
    }

    /**
     * Get the product tags as array
     */
    public function getTagsArrayAttribute()
    {
        if (!$this->tags) {
            return [];
        }

        return array_map('trim', explode(',', $this->tags));
    }

    /**
     * Check if the product is negotiable
     */
    public function getIsNegotiableAttribute()
    {
        return $this->negotiable && $this->minimum_price && $this->minimum_price < $this->price;
    }

    /**
     * Get the SEO-friendly URL slug
     */
    public function getSlugAttribute()
    {
        $slug = strtolower($this->title);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');
        return $slug . '-' . $this->id;
    }

    /**
     * Approve the product
     */
    public function approve()
    {
        $this->update([
            'status' => 'active',
            'approval_date' => now(),
            'rejection_reason' => null
        ]);
    }

    /**
     * Reject the product
     */
    public function reject($reason = null)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'approval_date' => null
        ]);
    }

    /**
     * Mark as sold
     */
    public function markAsSold()
    {
        $this->update([
            'status' => 'sold',
            'quantity_available' => 0
        ]);
    }

    /**
     * Increment views count
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * Increment favorites count
     */
    public function incrementFavorites()
    {
        $this->increment('favorites_count');
    }

    /**
     * Decrement favorites count
     */
    public function decrementFavorites()
    {
        $this->decrement('favorites_count');
    }
}
