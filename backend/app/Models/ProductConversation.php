<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductConversation extends Model
{
    protected $fillable = [
        'buyer_id',
        'seller_id',
        'product_id',
        'subject',
        'status',
        'last_message_at'
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the buyer for this conversation
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Buyer::class);
    }

    /**
     * Get the seller for this conversation
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    /**
     * Get the product for this conversation
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get all messages for this conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class, 'conversation_id');
    }

    /**
     * Get the latest message for this conversation
     */
    public function latestMessage(): HasMany
    {
        return $this->hasMany(ConversationMessage::class, 'conversation_id')->latest();
    }

    /**
     * Get unread messages count for a specific user
     */
    public function getUnreadCountForUser($userType, $userId): int
    {
        return $this->messages()
            ->where('sender_type', '!=', $userType)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Mark all messages as read for a specific user
     */
    public function markAsReadForUser($userType, $userId): void
    {
        $this->messages()
            ->where('sender_type', '!=', $userType)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);
    }
}
