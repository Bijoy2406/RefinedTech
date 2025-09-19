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
        Schema::table('admin_access_codes', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by_admin_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admin_access_codes', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by_admin_id')->nullable(false)->change();
        });
    }
};
