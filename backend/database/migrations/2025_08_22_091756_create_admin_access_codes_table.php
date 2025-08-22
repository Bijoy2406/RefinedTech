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
        Schema::create('admin_access_codes', function (Blueprint $table) {
            $table->id();
            $table->string('access_code')->unique();
            $table->unsignedBigInteger('created_by_admin_id');
            $table->unsignedBigInteger('used_by_admin_id')->nullable();
            $table->boolean('is_used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->text('description')->nullable(); // Optional description of what this code is for
            $table->timestamps();
            
            $table->foreign('created_by_admin_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('used_by_admin_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_access_codes');
    }
};
