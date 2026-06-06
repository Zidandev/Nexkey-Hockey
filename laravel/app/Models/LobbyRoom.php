<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LobbyRoom extends Model
{
    protected $table = 'lobby_rooms';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'room_name',
        'password',
        'player1_id',
        'player2_id',
        'player1_ready',
        'player2_ready',
        'status',
        'is_private',
        'board_skin',
    ];

    protected $casts = [
        'player1_ready' => 'boolean',
        'player2_ready' => 'boolean',
        'is_private' => 'boolean',
    ];

    public function player1()
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    public function player2()
    {
        return $this->belongsTo(User::class, 'player2_id');
    }
}
