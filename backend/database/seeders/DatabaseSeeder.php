<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Optional sample user
        // User::factory(10)->create();
        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Base data for consistent setups
        $this->call([
            SeparateTablesSeeder::class,
            AdminAccessCodeSeeder::class,
            AdminSeeder::class, // Add default admin
            ProductSeeder::class,
        ]);
    }
}
