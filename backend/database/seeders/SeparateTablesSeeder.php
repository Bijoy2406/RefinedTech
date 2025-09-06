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
        // Create initial admin access codes with 6-digit format
        AdminAccessCode::create([
            'access_code' => '123456',
            'description' => 'System generated admin access code #1',
            'created_by_admin_id' => null,
            'is_used' => false,
        ]);

        AdminAccessCode::create([
            'access_code' => '234567',
            'description' => 'System generated admin access code #2',
            'created_by_admin_id' => null,
            'is_used' => false,
        ]);

        AdminAccessCode::create([
            'access_code' => '345678',
            'description' => 'System generated admin access code #3',
            'created_by_admin_id' => null,
            'is_used' => false,
        ]);

        $this->command->info('✅ Created 3 system admin access codes with 6-digit format.');
        $this->command->info('Available codes: 123456, 234567, 345678');
    }
}
