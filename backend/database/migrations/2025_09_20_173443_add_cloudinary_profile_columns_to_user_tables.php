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
        // Add Cloudinary profile image columns to buyers table
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('phone_number');
            $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            $table->longText('profile_image')->nullable()->after('profile_image_public_id');
            $table->string('profile_image_mime')->nullable()->after('profile_image');
        });

        // Add Cloudinary profile image columns to sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('phone_number');
            $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            $table->longText('profile_image')->nullable()->after('profile_image_public_id');
            $table->string('profile_image_mime')->nullable()->after('profile_image');
        });

        // Add Cloudinary profile image columns to admins table
        Schema::table('admins', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('country');
            $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            $table->longText('profile_image')->nullable()->after('profile_image_public_id');
            $table->string('profile_image_mime')->nullable()->after('profile_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn(['profile_image_url', 'profile_image_public_id', 'profile_image', 'profile_image_mime']);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['profile_image_url', 'profile_image_public_id', 'profile_image', 'profile_image_mime']);
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['profile_image_url', 'profile_image_public_id', 'profile_image', 'profile_image_mime']);
        });
    }
};
