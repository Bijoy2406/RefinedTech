<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\AdminAccessCode;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default approved admin
        $admin = Admin::firstOrCreate(
            ['email' => 'bijoy@refinedtech.com'],
            [
                'name' => 'Bijoy Admin',
                'first_name' => 'Bijoy',
                'last_name' => 'Admin',
                'email' => 'bijoy@refinedtech.com',
                'email_verified_at' => now(),
                'password' => Hash::make('123456'),
                'admin_access_code' => 'SEED-ADMIN-001',
                'admin_username' => 'bijoy_admin',
                'country' => 'Bangladesh',
                'id_proof_reference' => 'SEED-ADMIN-ID-001',
                'status' => 'approved', // Pre-approved admin
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Create corresponding access code if admin was created
        if ($admin->wasRecentlyCreated) {
            AdminAccessCode::firstOrCreate(
                ['access_code' => 'SEED-ADMIN-001'],
                [
                    'access_code' => 'SEED-ADMIN-001',
                    'created_by_admin_id' => null, // System generated
                    'used_by_admin_id' => $admin->id,
                    'is_used' => true,
                    'used_at' => now(),
                    'description' => 'Default seeded admin access code',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $this->command?->info('✅ Created default admin: bijoy@refinedtech.com (password: 123456)');
        } else {
            $this->command?->info('ℹ️  Default admin already exists: bijoy@refinedtech.com');
        }
    }
}