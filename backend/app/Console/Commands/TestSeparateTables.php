<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Buyer;
use App\Models\Seller;
use App\Models\Admin;
use App\Models\AdminAccessCode;
use Illuminate\Support\Facades\Hash;

class TestSeparateTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:separate-tables';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the separate tables functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🧪 Testing Separate Tables Structure...');
        
        try {
            // Test creating a buyer
            $buyer = Buyer::create([
                'name' => 'Test Buyer',
                'first_name' => 'Test',
                'last_name' => 'Buyer',
                'email' => 'testbuyer@example.com',
                'password' => Hash::make('password123'),
                'country' => 'United States',
                'phone_number' => '+1234567890',
                'status' => 'approved'
            ]);
            $this->info("✅ Created buyer: {$buyer->name} ({$buyer->email})");

            // Test creating a seller
            $seller = Seller::create([
                'name' => 'Test Seller',
                'first_name' => 'Test',
                'last_name' => 'Seller',
                'email' => 'testseller@example.com',
                'password' => Hash::make('password123'),
                'country' => 'United States',
                'phone_number' => '+1234567890',
                'shop_username' => 'testshop123',
                'date_of_birth' => '1990-05-15',
                'business_address' => '123 Business St',
                'status' => 'pending'
            ]);
            $this->info("✅ Created seller: {$seller->name} ({$seller->email})");

            // Test creating an admin
            $admin = Admin::create([
                'name' => 'Test Admin',
                'first_name' => 'Test',
                'last_name' => 'Admin',
                'email' => 'testadmin@example.com',
                'password' => Hash::make('password123'),
                'admin_access_code' => 'ADM-SYSTEM01',
                'admin_username' => 'testadmin123',
                'country' => 'United States',
                'id_proof_reference' => 'ADMIN-ID-123',
                'status' => 'pending'
            ]);
            $this->info("✅ Created admin: {$admin->name} ({$admin->email})");

            // Show table counts
            $this->info("\n📊 Table Statistics:");
            $this->line("   Buyers: " . Buyer::count());
            $this->line("   Sellers: " . Seller::count());
            $this->line("   Admins: " . Admin::count());
            $this->line("   Admin Access Codes: " . AdminAccessCode::count());

            // Show roles
            $this->info("\n🔑 Roles Test:");
            $this->line("   Buyer role: " . $buyer->role);
            $this->line("   Seller role: " . $seller->role);
            $this->line("   Admin role: " . $admin->role);

            $this->info("\n🎉 All separate table tests passed!");
            
        } catch (\Exception $e) {
            $this->error("❌ Test failed: " . $e->getMessage());
        }

        return 0;
    }
}
