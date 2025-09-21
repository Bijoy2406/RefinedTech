<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminAccessCode extends Model
{
    protected $fillable = [
        'access_code',
        'created_by_admin_id',
        'used_by_admin_id',
        'is_used',
        'used_at',
        'description',
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'used_at' => 'datetime',
    ];

    /**
     * The admin who created this access code
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'created_by_admin_id');
    }

    /**
     * The admin who used this access code
     */
    public function usedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'used_by_admin_id');
    }

    /**
     * Mark this code as used
     */
    public function markAsUsed($adminId)
    {
        $this->update([
            'is_used' => true,
            'used_by_admin_id' => $adminId,
            'used_at' => now(),
        ]);
    }

    /**
     * Generate a unique access code
     */
    public static function generateUniqueCode()
    {
        do {
            $code = 'ADM-' . strtoupper(bin2hex(random_bytes(4))); // Generates ADM-XXXXXXXX format
        } while (self::where('access_code', $code)->exists());

        return $code;
    }

    /**
     * Generate multiple unique access codes for a new admin
     */
    public static function generateMultipleCodesForNewAdmin($adminId, $count = 3)
    {
        $codes = [];
        
        for ($i = 1; $i <= $count; $i++) {
            $code = self::create([
                'access_code' => self::generateUniqueCode(),
                'created_by_admin_id' => $adminId,
                'description' => "Access code #{$i} for new admin (auto-generated)",
            ]);
            
            $codes[] = $code;
        }
        
        return $codes;
    }
}
