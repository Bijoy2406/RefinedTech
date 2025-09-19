<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminAccessCode;
use App\Models\User;

class AdminAccessCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the first admin user to act as the creator of these codes
        // If no admin exists, we'll create codes with created_by_admin_id = 1 (assuming system admin)
        $systemAdminId = User::where('role', 'Admin')->first()?->id ?? 1;

        // Create some initial admin access codes
        $codes = [
            [
                'access_code' => 'ADM-SYSTEM01',
                'description' => 'System administrator access code',
            ],
            [
                'access_code' => 'ADM-MANAGER01', 
                'description' => 'Manager level access code',
            ],
            [
                'access_code' => 'ADM-SUPPORT01',
                'description' => 'Support team access code',
            ],
        ];

        foreach ($codes as $codeData) {
            AdminAccessCode::create([
                'access_code' => $codeData['access_code'],
                'created_by_admin_id' => $systemAdminId,
                'description' => $codeData['description'],
            ]);
        }

        // Generate 5 additional unique codes
        for ($i = 1; $i <= 5; $i++) {
            AdminAccessCode::create([
                'access_code' => AdminAccessCode::generateUniqueCode(),
                'created_by_admin_id' => $systemAdminId,
                'description' => "Auto-generated access code #{$i}",
            ]);
        }
    }
}
