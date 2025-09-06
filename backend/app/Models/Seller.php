<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Seller extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['role'];

    protected function getProfileImageBase64Attribute()
    {
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
        'shop_username',
        'date_of_birth',
        'business_address',
        'national_id_path',
        'proof_of_ownership_path',
        'status',
        'admin_access_code',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    'profile_image',
    'profile_image_mime',
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
        return 'Seller';
    }
}
