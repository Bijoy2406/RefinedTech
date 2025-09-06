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

        // Modify the products table to change default status from 'pending' to 'active'
        Schema::table('products', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'rejected', 'sold', 'draft'])
                  ->default('active')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the default status back to 'pending'
        Schema::table('products', function (Blueprint $table) {
            $table->enum('status', ['pending', 'active', 'rejected', 'sold', 'draft'])
                  ->default('pending')
                  ->change();
        });

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
