<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['admins','buyers','sellers'] as $tbl) {
            // Add profile_image as LONGBLOB via raw SQL if not exists
            if (!Schema::hasColumn($tbl, 'profile_image')) {
                DB::statement("ALTER TABLE `{$tbl}` ADD `profile_image` LONGBLOB NULL AFTER `status`");
            }
            if (!Schema::hasColumn($tbl, 'profile_image_mime')) {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->string('profile_image_mime')->nullable()->after('profile_image');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['admins','buyers','sellers'] as $tbl) {
            Schema::table($tbl, function (Blueprint $table) use ($tbl) {
                if (Schema::hasColumn($tbl, 'profile_image_mime')) {
                    $table->dropColumn('profile_image_mime');
                }
            });
            if (Schema::hasColumn($tbl, 'profile_image')) {
                DB::statement("ALTER TABLE `{$tbl}` DROP COLUMN `profile_image`");
            }
        }
    }
};
