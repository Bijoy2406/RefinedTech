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
        Schema::table('orders', function (Blueprint $table) {
            // Add missing seller_id column
            $table->unsignedBigInteger('seller_id')->after('buyer_id');
            
            // Add missing amount columns
            $table->decimal('subtotal', 10, 2)->after('total_amount');
            $table->decimal('discount_amount', 8, 2)->default(0)->after('tax_amount');
            $table->decimal('final_amount', 10, 2)->after('discount_amount');
            
            // Split shipping_address into separate fields
            $table->string('shipping_address_line1')->after('shipping_address');
            $table->string('shipping_address_line2')->nullable()->after('shipping_address_line1');
            
            // Add billing address fields
            $table->string('billing_address_line1')->nullable()->after('shipping_phone');
            $table->string('billing_address_line2')->nullable()->after('billing_address_line1');
            $table->string('billing_city')->nullable()->after('billing_address_line2');
            $table->string('billing_state')->nullable()->after('billing_city');
            $table->string('billing_postal_code')->nullable()->after('billing_state');
            $table->string('billing_country')->nullable()->after('billing_postal_code');
            $table->string('billing_phone')->nullable()->after('billing_country');
            
            // Add payment method and gateway fields
            $table->enum('payment_method', ['sslcommerz'])->after('payment_status');
            $table->string('payment_reference')->nullable()->after('payment_method');
            $table->string('payment_gateway')->nullable()->after('payment_reference');
            $table->string('transaction_id')->nullable()->after('payment_gateway');
            
            // Add tracking and carrier fields
            $table->string('tracking_number')->nullable()->after('transaction_id');
            $table->string('shipping_carrier')->nullable()->after('tracking_number');
            $table->date('estimated_delivery_date')->nullable()->after('shipping_carrier');
            $table->date('actual_delivery_date')->nullable()->after('estimated_delivery_date');
            
            // Add separate note fields
            $table->text('buyer_notes')->nullable()->after('actual_delivery_date');
            $table->text('seller_notes')->nullable()->after('buyer_notes');
            $table->text('admin_notes')->nullable()->after('seller_notes');
            
            // Add timestamp fields
            $table->timestamp('confirmed_at')->nullable()->after('admin_notes');
            $table->timestamp('cancelled_at')->nullable()->after('delivered_at');
            
            // Add foreign key constraint for seller_id
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            $table->index('seller_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['seller_id']);
            
            // Drop all added columns
            $table->dropColumn([
                'seller_id',
                'subtotal',
                'discount_amount',
                'final_amount',
                'shipping_address_line1',
                'shipping_address_line2',
                'billing_address_line1',
                'billing_address_line2',
                'billing_city',
                'billing_state',
                'billing_postal_code',
                'billing_country',
                'billing_phone',
                'payment_method',
                'payment_reference',
                'payment_gateway',
                'transaction_id',
                'tracking_number',
                'shipping_carrier',
                'estimated_delivery_date',
                'actual_delivery_date',
                'buyer_notes',
                'seller_notes',
                'admin_notes',
                'confirmed_at',
                'cancelled_at',
            ]);
        });
    }
};
