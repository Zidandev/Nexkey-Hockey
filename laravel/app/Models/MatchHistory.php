<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchHistory extends Model
{
    protected $table = 'match_histories';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'opponent_name',
        'mode',
        'player_rank',
        'score_self',
        'score_opponent',
        'exp_earned',
        'currency_earned',
        'played_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
