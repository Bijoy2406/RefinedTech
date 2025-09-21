<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing products with 'pending' status to 'active'
        DB::table('products')
            ->where('status', 'pending')
            ->update([
                'status' => 'active',
                'approval_date' => now(),
                'updated_at' => now()
            ]);

        // For PostgreSQL, we need to alter the default value directly
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE products ALTER COLUMN status SET DEFAULT 'active'");
        } elseif (DB::getDriverName() === 'mysql') {
            // For MySQL/other databases
            Schema::table('products', function (Blueprint $table) {
                $table->enum('status', ['pending', 'active', 'rejected', 'sold', 'draft'])
                      ->default('active')
                      ->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For PostgreSQL, we need to alter the default value directly
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE products ALTER COLUMN status SET DEFAULT 'pending'");
        } elseif (DB::getDriverName() === 'mysql') {
            // For MySQL/other databases
            Schema::table('products', function (Blueprint $table) {
                $table->enum('status', ['pending', 'active', 'rejected', 'sold', 'draft'])
                      ->default('pending')
                      ->change();
            });
        }

        // Optionally revert existing products back to pending (uncomment if needed)
        // DB::table('products')
        //     ->where('status', 'active')
        //     ->whereNull('sold_at')
        //     ->update([
        //         'status' => 'pending',
        //         'approval_date' => null,
        //         'updated_at' => now()
        //     ]);
    }
};
