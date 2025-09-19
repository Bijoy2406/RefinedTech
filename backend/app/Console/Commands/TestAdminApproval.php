<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\AdminAccessCode;
use Illuminate\Support\Facades\Hash;

class TestAdminApproval extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:admin-approval';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the admin approval process with access code generation';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Admin Approval Process...');
        
        // Create a pending admin user
        $admin = User::create([
            'name' => 'Test Admin User',
            'first_name' => 'Test',
            'last_name' => 'Admin',
            'email' => 'testadmin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'Admin',
            'status' => 'pending',
            'admin_access_code' => 'ADM-SYSTEM01', // Using one of our seeded codes
            'admin_username' => 'testadmin',
            'country' => 'Test Country',
            'id_proof_reference' => 'Test ID Reference'
        ]);

        $this->info("✅ Created pending admin: {$admin->name} ({$admin->email})");

        // Simulate approval process
        $admin->update(['status' => 'approved']);
        
        // Generate access codes (this simulates what happens in AdminController)
        $accessCodes = AdminAccessCode::generateMultipleCodesForNewAdmin($admin->id, 3);
        
        $this->info("✅ Admin approved! Generated access codes:");
        
        foreach ($accessCodes as $code) {
            $this->line("   🔑 {$code->access_code} - {$code->description}");
        }
        
        // Show current status
        $totalUnusedCodes = AdminAccessCode::where('is_used', false)->count();
        $this->info("📊 Total unused access codes in system: {$totalUnusedCodes}");
        
        // Show codes created by this admin
        $myCodesCount = AdminAccessCode::where('created_by_admin_id', $admin->id)->count();
        $this->info("📊 Access codes created by {$admin->name}: {$myCodesCount}");

        $this->info('🎉 Test completed successfully!');
        
        return 0;
    }
}
