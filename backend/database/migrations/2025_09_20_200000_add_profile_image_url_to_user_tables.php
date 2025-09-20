<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable();
            $table->string('profile_image_public_id')->nullable();
        });
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable();
            $table->string('profile_image_public_id')->nullable();
        });
        Schema::table('sellers', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable();
            $table->string('profile_image_public_id')->nullable();
        });
    }

    public function down()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['profile_image_url', 'profile_image_public_id']);
        });
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropColumn(['profile_image_url', 'profile_image_public_id']);
        });
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropColumn(['profile_image_url', 'profile_image_public_id']);
        });
    }
};
