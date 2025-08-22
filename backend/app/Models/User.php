<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'phone_number',
        'shop_username',
        'date_of_birth',
        'national_id',
        'business_address',
        'proof_of_ownership',
        'admin_access_code',
        'admin_username',
        'country',
        'id_proof_reference',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
    ];
}
