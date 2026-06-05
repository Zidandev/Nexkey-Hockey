<?php

/**
 * Laravel Migrations for Nexkey (Neon Matrix Air Hockey Game)
 * Stack: Laravel + MySQL
 * Credits by Zidandev
 * Code is complete with NO placeholders.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// ==========================================
// 1. Users Table Migration
// ==========================================
class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('username', 100)->unique();
            $table->string('email', 255)->unique();
            $table->enum('role', ['admin', 'player'])->default('player');
            $table->integer('level')->default(1);
            $table->integer('exp')->default(0);
            $table->integer('max_exp')->default(100);
            $table->integer('currency')->default(100);
            $table->string('active_paddle_skin', 50)->default('paddle_cyan');
            $table->string('active_board_skin', 50)->default('board_neon');
            $table->boolean('is_banned')->default(false);
            $table->timestamps();
            
            $table->index('username');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}

// ==========================================
// 2. Shop Items Table Migration
// ==========================================
class CreateShopItemsTable extends Migration
{
    public function up()
    {
        Schema::create('shop_items', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('name', 100);
            $table->enum('category', ['paddle', 'board']);
            $table->integer('cost')->default(0);
            $table->string('style_value', 100);
            $table->text('description')->nullable();
            $table->boolean('unlocked_by_default')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('shop_items');
    }
}

// ==========================================
// 3. User Inventories Table Migration
// ==========================================
class CreateUserInventoriesTable extends Migration
{
    public function up()
    {
        Schema::create('user_inventories', function (Blueprint $table) {
            $table->string('user_id', 50);
            $table->string('item_id', 50);
            $table->timestamp('unlocked_at')->useCurrent();
            
            $table->primary(['user_id', 'item_id']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('item_id')->references('id')->on('shop_items')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_inventories');
    }
}

// ==========================================
// 4. Player Statistics Table Migration
// ==========================================
class CreatePlayerStatisticsTable extends Migration
{
    public function up()
    {
        Schema::create('player_statistics', function (Blueprint $table) {
            $table->string('user_id', 50)->primary();
            $table->integer('total_matches')->default(0);
            $table->integer('total_wins')->default(0);
            $table->integer('total_losses')->default(0);
            $table->integer('win_rate')->default(0);
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('player_statistics');
    }
}

// ==========================================
// 5. Match History Table Migration
// ==========================================
class CreateMatchHistoriesTable extends Migration
{
    public function up()
    {
        Schema::create('match_histories', function (Blueprint $table) {
            $table->string('id', 50)->primary();
            $table->string('user_id', 50);
            $table->string('opponent_name', 100);
            $table->enum('mode', ['ai', 'multiplayer']);
            $table->enum('player_rank', ['win', 'loss']);
            $table->integer('score_self')->default(0);
            $table->integer('score_opponent')->default(0);
            $table->integer('exp_earned')->default(0);
            $table->integer('currency_earned')->default(0);
            $table->timestamp('played_at')->useCurrent();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('match_histories');
    }
}

// ==========================================
// 6. Live Games Coordinate State Synchronization Table Migration
// ==========================================
class CreateLiveGamesTable extends Migration
{
    public function up()
    {
        Schema::create('live_games', function (Blueprint $table) {
            $table->string('game_id', 50)->primary();
            $table->string('player1_id', 50)->nullable();
            $table->string('player2_id', 50)->nullable();
            
            // Decimal values for speed tracking, coordinates mapping
            $table->double('puck_x');
            $table->double('puck_y');
            $table->double('puck_vx');
            $table->double('puck_vy');
            
            $table->double('player1_x');
            $table->double('player1_y');
            $table->double('player2_x');
            $table->double('player2_y');
            
            $table->integer('score1')->default(0);
            $table->integer('score2')->default(0);
            
            $table->enum('status', ['waiting', 'active', 'finished'])->default('waiting');
            $table->string('winner_id', 50)->nullable();
            $table->string('board_skin', 50)->default('board_neon');
            
            $table->bigInteger('last_updated_at');
            
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('live_games');
    }
}
