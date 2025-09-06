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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('seller_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('subcategory')->nullable();
            $table->string('brand');
            $table->string('model');
            $table->string('sku')->unique();
            $table->enum('condition_grade', ['like-new', 'excellent', 'good', 'fair']);
            $table->text('condition_description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->integer('quantity_available')->default(1);
            $table->string('warranty_period')->nullable();
            $table->text('return_policy')->nullable();
            $table->string('shipping_weight')->nullable();
            $table->string('dimensions')->nullable();
            $table->string('color')->nullable();
            $table->string('storage_capacity')->nullable();
            $table->string('ram_memory')->nullable();
            $table->string('processor')->nullable();
            $table->string('operating_system')->nullable();
            $table->string('battery_health')->nullable();
            $table->string('screen_size')->nullable();
            $table->string('connectivity')->nullable();
            $table->text('included_accessories')->nullable();
            $table->text('defects_issues')->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('usage_duration')->nullable();
            $table->text('reason_for_selling')->nullable();
            $table->string('tags')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_urgent_sale')->default(false);
            $table->boolean('negotiable')->default(true);
            $table->decimal('minimum_price', 10, 2)->nullable();
            $table->string('location_city')->nullable();
            $table->string('location_state')->nullable();
            $table->text('shipping_options')->nullable();
            $table->enum('status', ['pending', 'active', 'rejected', 'sold', 'draft'])->default('pending');
            $table->timestamp('approval_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->integer('views_count')->default(0);
            $table->integer('favorites_count')->default(0);
            $table->timestamps();
            
            // Foreign key constraint
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            
            // Indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index(['category', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index(['price']);
            $table->index(['condition_grade']);
            $table->fullText(['title', 'description', 'brand', 'model', 'tags']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
