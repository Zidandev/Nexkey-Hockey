<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateShopItemsTable extends Migration
{
    public function up()
    {
        Schema::create('shop_items', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. paddle_cyan
            $table->string('name');
            $table->string('category'); // e.g. paddle, board
            $table->integer('cost')->default(0);
            $table->string('style_value');
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
