<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PlayerStat;
use App\Models\MatchHistory;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // Retrieve all players with stats, supporting filter query
    public function players(Request $request)
    {
        try {
            $search = $request->query('search');
            $query = User::query();

            if ($search) {
                $searchLower = strtolower(trim($search));
                $query->where('username', 'LIKE', "%{$searchLower}%")
                    ->orWhere('email', 'LIKE', "%{$searchLower}%");
            }

            $players = $query->get();

            $playersWithStats = $players->map(function ($p) {
                $stats = PlayerStat::where('user_id', $p->id)->first();
                if (!$stats) {
                    $stats = [
                        'user_id' => $p->id,
                        'total_matches' => 0,
                        'total_wins' => 0,
                        'total_losses' => 0,
                        'win_rate' => 0
                    ];
                }
                return array_merge($p->toArray(), ['stats' => $stats]);
            });

            return $this->jsonResponse([
                'success' => true,
                'players' => $playersWithStats
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Modify profile parameters or toggle ban states
    public function updatePlayer(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            $currency = $request->input('currency');
            $level = $request->input('level');
            $isBanned = $request->input('isBanned');
            $role = $request->input('role');

            $updates = [];
            if ($currency !== null) $updates['currency'] = (int)$currency;
            if ($level !== null) $updates['level'] = (int)$level;
            if ($isBanned !== null) $updates['is_banned'] = (bool)$isBanned;
            if ($role !== null) $updates['role'] = $role;

            $user->update($updates);

            return $this->jsonResponse([
                'success' => true,
                'user' => $user->fresh(),
                'stats' => PlayerStat::where('user_id', $id)->first()
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Completely delete a user grid account
    public function deletePlayer($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            $user->delete();

            return $this->jsonResponse([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Server economic stats summaries
    public function serverStats()
    {
        try {
            $usersCount = User::count();
            $adminCount = User::where('role', 'admin')->count();
            $playerCount = $usersCount - $adminCount;
            $bannedCount = User::where('is_banned', true)->count();
            $totalMatchesPlayed = MatchHistory::count();
            $totalCredits = User::sum('currency');

            return $this->jsonResponse([
                'success' => true,
                'stats' => [
                    'usersCount' => $usersCount,
                    'adminCount' => $adminCount,
                    'playerCount' => $playerCount,
                    'bannedCount' => $bannedCount,
                    'totalMatchesPlayed' => $totalMatchesPlayed,
                    'totalCredits' => $totalCredits
                ]
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
