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
        // Add the missing profile_image and profile_image_mime columns to all user tables
        Schema::table('buyers', function (Blueprint $table) {
            if (!Schema::hasColumn('buyers', 'profile_image')) {
                $table->binary('profile_image')->nullable()->after('profile_picture');
            }
            if (!Schema::hasColumn('buyers', 'profile_image_mime')) {
                $table->string('profile_image_mime', 100)->nullable()->after('profile_image');
            }
        });

        Schema::table('sellers', function (Blueprint $table) {
            if (!Schema::hasColumn('sellers', 'profile_image')) {
                $table->binary('profile_image')->nullable()->after('profile_picture');
            }
            if (!Schema::hasColumn('sellers', 'profile_image_mime')) {
                $table->string('profile_image_mime', 100)->nullable()->after('profile_image');
            }
        });

        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'profile_image')) {
                $table->binary('profile_image')->nullable()->after('profile_picture');
            }
            if (!Schema::hasColumn('admins', 'profile_image_mime')) {
                $table->string('profile_image_mime', 100)->nullable()->after('profile_image');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn(['profile_image', 'profile_image_mime']);
        });

        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['profile_image', 'profile_image_mime']);
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['profile_image', 'profile_image_mime']);
        });
    }
};
