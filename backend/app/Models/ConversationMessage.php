<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_type',
        'sender_id',
        'message',
        'attachments',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Get the conversation for this message
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ProductConversation::class, 'conversation_id');
    }

    /**
     * Get the sender (buyer or seller) for this message
     */
    public function sender(): BelongsTo
    {
        if ($this->sender_type === 'buyer') {
            return $this->belongsTo(Buyer::class, 'sender_id');
        }
        
        return $this->belongsTo(Seller::class, 'sender_id');
    }

    /**
     * Get sender information
     */
    public function getSenderAttribute()
    {
        if ($this->sender_type === 'buyer') {
            return Buyer::find($this->sender_id);
        }
        
        return Seller::find($this->sender_id);
    }

    /**
     * Scope for unread messages
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for messages by sender type
     */
    public function scopeBySenderType($query, $senderType)
    {
        return $query->where('sender_type', $senderType);
    }
}
