<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Append accessor attributes when model is serialized.
     * Ensure 'role' shows up in API responses like /api/user.
     *
     * @var array<int, string>
     */
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
        'admin_access_code',
        'admin_username',
        'country',
        'id_proof_reference',
        'status',
        'profile_image_url',
        'profile_image_public_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'profile_image',
        'profile_image_mime',
        'profile_image_public_id',
        'password',
        'remember_token',
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
        ];
    }

    /**
     * Get the role attribute for authentication
     */
    public function getRoleAttribute()
    {
        return 'Admin';
    }
}
