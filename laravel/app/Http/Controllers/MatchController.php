<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PlayerStat;
use App\Models\MatchHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MatchController extends Controller
{
    // Save completed match record on the grid
    public function store(Request $request)
    {
        try {
            $request->validate([
                'userId' => 'required',
                'opponentName' => 'required|string',
                'mode' => 'required|string',
                'playerRank' => 'required|string',
                'scoreSelf' => 'required|integer',
                'scoreOpponent' => 'required|integer',
                'expEarned' => 'required|integer',
                'currencyEarned' => 'required|integer',
            ]);

            $userId = $request->input('userId');
            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Missing userId context'
                ], 404);
            }

            $historyRecord = DB::transaction(function () use ($request, $user, $userId) {
                $opponentName = $request->input('opponentName');
                $mode = $request->input('mode');
                $playerRank = $request->input('playerRank');
                $scoreSelf = $request->input('scoreSelf');
                $scoreOpponent = $request->input('scoreOpponent');
                $expEarned = $request->input('expEarned');
                $currencyEarned = $request->input('currencyEarned');

                // Create history
                $match = MatchHistory::create([
                    'id' => 'match_' . Str::random(8),
                    'user_id' => $userId,
                    'opponent_name' => $opponentName,
                    'mode' => $mode,
                    'player_rank' => $playerRank,
                    'score_self' => $scoreSelf,
                    'score_opponent' => $scoreOpponent,
                    'exp_earned' => $expEarned,
                    'currency_earned' => $currencyEarned,
                    'played_at' => now()
                ]);

                // Update Stats
                $stats = PlayerStat::firstOrCreate(
                    ['user_id' => $userId],
                    ['total_matches' => 0, 'total_wins' => 0, 'total_losses' => 0, 'win_rate' => 0]
                );

                $stats->increment('total_matches');
                if ($playerRank === 'win') {
                    $stats->increment('total_wins');
                } else {
                    $stats->increment('total_losses');
                }
                
                $stats->win_rate = round(($stats->total_wins / $stats->total_matches) * 100);
                $stats->save();

                // Reward XP & Currency
                $user->increment('currency', $currencyEarned);
                $user->increment('exp', $expEarned);

                // Level up computation
                while ($user->exp >= $user->max_exp) {
                    $user->exp -= $user->max_exp;
                    $user->increment('level');
                    $user->max_exp = round($user->max_exp * 1.5);
                }
                $user->save();

                return $match;
            });

            return $this->jsonResponse([
                'success' => true,
                'user' => $user->fresh(),
                'stats' => PlayerStat::where('user_id', $userId)->first(),
                'historyRecord' => $historyRecord
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
