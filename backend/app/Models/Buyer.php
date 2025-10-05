<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Buyer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['role'];

    protected function getProfileImageBase64Attribute()
    {
        // Priority: Return Cloudinary URL if available
        if ($this->profile_image_url) {
            return $this->profile_image_url;
        }
        
        // Fallback to legacy BLOB data
        if (!$this->profile_image) return null;
        $mime = $this->profile_image_mime ?? 'image/jpeg';
        return 'data:' . $mime . ';base64,' . base64_encode($this->profile_image);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'country',
        'phone_number',
        'address',
        'city',
        'state',
        'postal_code',
        'status',
        'admin_access_code',
        'profile_image_url',
        'profile_image_public_id',
        'profile_image',
        'profile_image_mime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'profile_image',
        'profile_image_mime',
        'profile_image_public_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
        ];
    }

    /**
     * Get the role attribute for authentication
     */
    public function getRoleAttribute()
    {
        return 'Buyer';
    }
}