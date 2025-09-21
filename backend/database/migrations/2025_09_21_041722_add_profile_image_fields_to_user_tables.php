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
        // Add profile image fields to buyers table (only if they don't exist)
        Schema::table('buyers', function (Blueprint $table) {
            if (!Schema::hasColumn('buyers', 'profile_image_url')) {
                $table->string('profile_image_url')->nullable()->after('phone_number');
            }
            if (!Schema::hasColumn('buyers', 'profile_image_public_id')) {
                $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            }
            if (!Schema::hasColumn('buyers', 'profile_image')) {
                $table->longText('profile_image')->nullable()->after('profile_image_public_id'); // BLOB fallback
            }
            if (!Schema::hasColumn('buyers', 'profile_image_mime')) {
                $table->string('profile_image_mime')->nullable()->after('profile_image'); // MIME type for BLOB
            }
        });

        // Add profile image fields to sellers table (only if they don't exist)
        Schema::table('sellers', function (Blueprint $table) {
            if (!Schema::hasColumn('sellers', 'profile_image_url')) {
                $table->string('profile_image_url')->nullable()->after('phone_number');
            }
            if (!Schema::hasColumn('sellers', 'profile_image_public_id')) {
                $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            }
            if (!Schema::hasColumn('sellers', 'profile_image')) {
                $table->longText('profile_image')->nullable()->after('profile_image_public_id'); // BLOB fallback
            }
            if (!Schema::hasColumn('sellers', 'profile_image_mime')) {
                $table->string('profile_image_mime')->nullable()->after('profile_image'); // MIME type for BLOB
            }
        });

        // Add profile image fields to admins table (only if they don't exist)
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'profile_image_url')) {
                $table->string('profile_image_url')->nullable()->after('country');
            }
            if (!Schema::hasColumn('admins', 'profile_image_public_id')) {
                $table->string('profile_image_public_id')->nullable()->after('profile_image_url');
            }
            if (!Schema::hasColumn('admins', 'profile_image')) {
                $table->longText('profile_image')->nullable()->after('profile_image_public_id'); // BLOB fallback
            }
            if (!Schema::hasColumn('admins', 'profile_image_mime')) {
                $table->string('profile_image_mime')->nullable()->after('profile_image'); // MIME type for BLOB
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove profile image fields from buyers table (only if they exist)
        Schema::table('buyers', function (Blueprint $table) {
            $columnsToRemove = [];
            if (Schema::hasColumn('buyers', 'profile_image_url')) {
                $columnsToRemove[] = 'profile_image_url';
            }
            if (Schema::hasColumn('buyers', 'profile_image_public_id')) {
                $columnsToRemove[] = 'profile_image_public_id';
            }
            if (Schema::hasColumn('buyers', 'profile_image')) {
                $columnsToRemove[] = 'profile_image';
            }
            if (Schema::hasColumn('buyers', 'profile_image_mime')) {
                $columnsToRemove[] = 'profile_image_mime';
            }
            if (!empty($columnsToRemove)) {
                $table->dropColumn($columnsToRemove);
            }
        });

        // Remove profile image fields from sellers table (only if they exist)
        Schema::table('sellers', function (Blueprint $table) {
            $columnsToRemove = [];
            if (Schema::hasColumn('sellers', 'profile_image_url')) {
                $columnsToRemove[] = 'profile_image_url';
            }
            if (Schema::hasColumn('sellers', 'profile_image_public_id')) {
                $columnsToRemove[] = 'profile_image_public_id';
            }
            if (Schema::hasColumn('sellers', 'profile_image')) {
                $columnsToRemove[] = 'profile_image';
            }
            if (Schema::hasColumn('sellers', 'profile_image_mime')) {
                $columnsToRemove[] = 'profile_image_mime';
            }
            if (!empty($columnsToRemove)) {
                $table->dropColumn($columnsToRemove);
            }
        });

        // Remove profile image fields from admins table (only if they exist)
        Schema::table('admins', function (Blueprint $table) {
            $columnsToRemove = [];
            if (Schema::hasColumn('admins', 'profile_image_url')) {
                $columnsToRemove[] = 'profile_image_url';
            }
            if (Schema::hasColumn('admins', 'profile_image_public_id')) {
                $columnsToRemove[] = 'profile_image_public_id';
            }
            if (Schema::hasColumn('admins', 'profile_image')) {
                $columnsToRemove[] = 'profile_image';
            }
            if (Schema::hasColumn('admins', 'profile_image_mime')) {
                $columnsToRemove[] = 'profile_image_mime';
            }
            if (!empty($columnsToRemove)) {
                $table->dropColumn($columnsToRemove);
            }
        });
    }
};
