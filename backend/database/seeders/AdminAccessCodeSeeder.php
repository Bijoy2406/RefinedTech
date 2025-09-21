<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminAccessCode;

class AdminAccessCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some initial admin access codes (system generated)
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
            AdminAccessCode::firstOrCreate(
                ['access_code' => $codeData['access_code']],
                [
                    'created_by_admin_id' => null, // System generated
                    'description' => $codeData['description'],
                    'is_used' => false,
                ]
            );
        }

        // Generate 3 additional unique codes
        for ($i = 1; $i <= 3; $i++) {
            $uniqueCode = AdminAccessCode::generateUniqueCode();
            AdminAccessCode::firstOrCreate(
                ['access_code' => $uniqueCode],
                [
                    'created_by_admin_id' => null, // System generated
                    'description' => "System generated admin access code #{$i}",
                    'is_used' => false,
                ]
            );
        }

        $this->command?->info('✅ Seeded admin access codes.');
    }
}
