<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerStat extends Model
{
    protected $table = 'player_stats';

    protected $fillable = [
        'user_id',
        'total_matches',
        'total_wins',
        'total_losses',
        'win_rate',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
