<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLobbyRoomsTable extends Migration
{
    public function up()
    {
        Schema::create('lobby_rooms', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('room_name');
            $table->string('password')->nullable();
            $table->unsignedBigInteger('player1_id');
            $table->unsignedBigInteger('player2_id')->nullable();
            $table->boolean('player1_ready')->default(false);
            $table->boolean('player2_ready')->default(false);
            $table->string('status')->default('waiting');
            $table->boolean('is_private')->default(false);
            $table->string('board_skin')->default('board_neon');
            $table->timestamps();

            $table->foreign('player1_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('player2_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('lobby_rooms');
    }
}
