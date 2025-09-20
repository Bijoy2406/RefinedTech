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
            // Add JSONB columns for PostgreSQL if they don't exist
            if (!Schema::hasColumn('products', 'options')) {
                $table->jsonb('options')->nullable();
            }
            if (!Schema::hasColumn('products', 'metadata')) {
                $table->jsonb('metadata')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Drop JSONB columns
            $table->dropColumn(['options', 'metadata']);
        });

        Schema::table('products', function (Blueprint $table) {
            // Add back regular JSON columns
            $table->json('options')->nullable();
            $table->json('metadata')->nullable();
        });
    }
};
