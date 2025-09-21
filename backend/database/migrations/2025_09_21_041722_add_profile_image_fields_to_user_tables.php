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
        // Add profile image fields to buyers table
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('phone_number');
            $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            $table->longText('profile_image')->nullable()->after('profile_image_public_id'); // BLOB fallback
            $table->string('profile_image_mime')->nullable()->after('profile_image'); // MIME type for BLOB
        });

        // Add profile image fields to sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('phone_number');
            $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            $table->longText('profile_image')->nullable()->after('profile_image_public_id'); // BLOB fallback
            $table->string('profile_image_mime')->nullable()->after('profile_image'); // MIME type for BLOB
        });

        // Add profile image fields to admins table
        Schema::table('admins', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('country');
            $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            $table->longText('profile_image')->nullable()->after('profile_image_public_id'); // BLOB fallback
            $table->string('profile_image_mime')->nullable()->after('profile_image'); // MIME type for BLOB
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove profile image fields from buyers table
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn([
                'profile_image_url',
                'profile_image_public_id',
                'profile_image',
                'profile_image_mime'
            ]);
        });

        // Remove profile image fields from sellers table
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn([
                'profile_image_url',
                'profile_image_public_id',
                'profile_image',
                'profile_image_mime'
            ]);
        });

        // Remove profile image fields from admins table
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn([
                'profile_image_url',
                'profile_image_public_id',
                'profile_image',
                'profile_image_mime'
            ]);
        });
    }
};
