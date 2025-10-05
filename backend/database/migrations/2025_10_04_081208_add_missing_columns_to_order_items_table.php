<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Add the missing columns that the application expects
            $table->string('product_sku')->nullable()->after('product_description');
            $table->string('product_condition')->nullable()->after('product_sku');
            $table->string('product_image_url')->nullable()->after('product_condition');
        });
        
        // In a separate schema call, rename the column
        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('product_name', 'product_title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename back to product_name
        Schema::table('order_items', function (Blueprint $table) {
            $table->renameColumn('product_title', 'product_name');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            // Remove the added columns
            $table->dropColumn([
                'product_sku',
                'product_condition',
                'product_image_url'
            ]);
        });
    }
};
