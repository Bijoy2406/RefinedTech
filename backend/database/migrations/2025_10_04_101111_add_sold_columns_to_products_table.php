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
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('sold_at')->nullable()->after('updated_at');
            $table->unsignedBigInteger('sold_to')->nullable()->after('sold_at');
            
            // Add foreign key constraint for sold_to referencing buyers table
            $table->foreign('sold_to')->references('id')->on('buyers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['sold_to']);
            $table->dropColumn(['sold_at', 'sold_to']);
        });
    }
};
