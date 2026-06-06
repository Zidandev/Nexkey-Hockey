<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'level',
        'exp',
        'max_exp',
        'currency',
        'active_paddle_skin',
        'active_board_skin',
        'is_banned',
        'bio',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_banned' => 'boolean',
    ];

    public function stats()
    {
        return $this->hasOne(PlayerStat::class, 'user_id');
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'user_id');
    }

    public function matchHistory()
    {
        return $this->hasMany(MatchHistory::class, 'user_id');
    }
}
