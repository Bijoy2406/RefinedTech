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
            Schema::table($tbl, function (Blueprint $table) {
                $table->longText('profile_image')->nullable();
                $table->string('profile_image_mime')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (['admins','buyers','sellers'] as $tbl) {
            Schema::table($tbl, function (Blueprint $table) {
                $table->dropColumn(['profile_image_mime', 'profile_image']);
            });
        }
    }
};
