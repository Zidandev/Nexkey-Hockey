<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTableWithRole extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('player'); // Make sure the users table migration has a 'role' column
            $table->integer('level')->default(1);
            $table->integer('exp')->default(0);
            $table->integer('max_exp')->default(100);
            $table->integer('currency')->default(100);
            $table->string('active_paddle_skin')->default('paddle_cyan');
            $table->string('active_board_skin')->default('board_neon');
            $table->boolean('is_banned')->default(false);
            $table->string('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
