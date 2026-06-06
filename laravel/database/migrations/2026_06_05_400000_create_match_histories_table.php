<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMatchHistoriesTable extends Migration
{
    public function up()
    {
        Schema::create('match_histories', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('opponent_name');
            $table->string('mode');
            $table->string('player_rank');
            $table->integer('score_self');
            $table->integer('score_opponent');
            $table->integer('exp_earned')->default(0);
            $table->integer('currency_earned')->default(0);
            $table->timestamp('played_at')->useCurrent();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('match_histories');
    }
}
