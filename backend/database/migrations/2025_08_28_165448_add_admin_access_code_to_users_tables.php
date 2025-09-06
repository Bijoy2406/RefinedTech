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
        // Add admin_access_code to buyers table
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('admin_access_code')->nullable()->after('phone_number');
        });

        // Add admin_access_code to sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->string('admin_access_code')->nullable()->after('phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove admin_access_code from buyers table
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn('admin_access_code');
        });

        // Remove admin_access_code from sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn('admin_access_code');
        });
    }
};
