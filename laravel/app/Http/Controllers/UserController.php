<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PlayerStat;
use App\Models\Inventory;
use App\Models\MatchHistory;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Retrieve player details, inventory skins, and historical records
    public function show($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            $stats = PlayerStat::where('user_id', $id)->first();
            if (!$stats) {
                $stats = PlayerStat::create([
                    'user_id' => $id,
                    'total_matches' => 0,
                    'total_wins' => 0,
                    'total_losses' => 0,
                    'win_rate' => 0
                ]);
            }

            // Map inventory items to array of string IDs
            $inventory = Inventory::where('user_id', $id)
                ->pluck('item_id')
                ->toArray();

            // Historical matches sorted descending
            $history = MatchHistory::where('user_id', $id)
                ->orderBy('played_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'user' => $user,
                'stats' => $stats,
                'inventory' => $inventory,
                'history' => $history
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update profile attributes (bio, profile nickname, avatar)
    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'User match not found'
                ], 404);
            }

            $request->validate([
                'username' => 'required|string',
                'bio' => 'nullable|string',
                'avatarUrl' => 'nullable|string'
            ]);

            $username = trim($request->input('username'));
            $bio = $request->input('bio');
            $avatarUrl = $request->input('avatarUrl');

            // Conflict check
            $existing = User::where('username', $username)->first();
            if ($existing && $existing->id !== (int)$id) {
                return response()->json([
                    'success' => false,
                    'error' => 'Username is already configured on another profile'
                ], 400);
            }

            $user->update([
                'username' => $username,
                'bio' => $bio !== null ? trim($bio) : $user->bio,
                'avatar_url' => $avatarUrl !== null ? trim($avatarUrl) : $user->avatar_url
            ]);

            // Load updated states
            $stats = PlayerStat::where('user_id', $id)->first();
            $inventory = Inventory::where('user_id', $id)->pluck('item_id')->toArray();
            $history = MatchHistory::where('user_id', $id)->orderBy('played_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'user' => $user,
                'stats' => $stats,
                'inventory' => $inventory,
                'history' => $history
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
