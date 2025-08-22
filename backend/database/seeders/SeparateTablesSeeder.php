<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AdminAccessCode;

class SeparateTablesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create initial admin access codes
        AdminAccessCode::create([
            'access_code' => 'ADM-SYSTEM01',
            'description' => 'System generated admin access code #1',
            'created_by_admin_id' => null,
            'is_used' => false,
        ]);

        AdminAccessCode::create([
            'access_code' => 'ADM-SYSTEM02',
            'description' => 'System generated admin access code #2',
            'created_by_admin_id' => null,
            'is_used' => false,
        ]);

        AdminAccessCode::create([
            'access_code' => 'ADM-SYSTEM03',
            'description' => 'System generated admin access code #3',
            'created_by_admin_id' => null,
            'is_used' => false,
        ]);

        $this->command->info('✅ Created 3 system admin access codes for separate tables structure.');
        $this->command->info('Available codes: ADM-SYSTEM01, ADM-SYSTEM02, ADM-SYSTEM03');
    }
}
