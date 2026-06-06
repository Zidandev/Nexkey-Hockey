<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\LobbyRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    // List open joinable rooms
    public function index()
    {
        try {
            $rooms = LobbyRoom::whereIn('status', ['waiting', 'full'])->get();
            
            $roomsWithUsernames = $rooms->map(function ($room) {
                $p1 = User::find($room->player1_id);
                $p2 = User::find($room->player2_id);
                
                return [
                    'id' => $room->id,
                    'roomName' => $room->room_name,
                    'player1_id' => $room->player1_id,
                    'player2_id' => $room->player2_id,
                    'player1_ready' => $room->player1_ready,
                    'player2_ready' => $room->player2_ready,
                    'status' => $room->status,
                    'isPrivate' => $room->is_private,
                    'boardSkin' => $room->board_skin,
                    'player1_username' => $p1 ? $p1->username : 'Unknown',
                    'player1_level' => $p1 ? $p1->level : 1,
                    'player2_username' => $p2 ? $p2->username : null,
                    'player2_level' => $p2 ? $p2->level : null,
                ];
            });

            return response()->json([
                'success' => true,
                'rooms' => $roomsWithUsernames
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Host joinable lobby
    public function create(Request $request)
    {
        try {
            $request->validate([
                'roomName' => 'required|string',
                'userId' => 'required',
                'password' => 'nullable|string',
                'isPrivate' => 'nullable|boolean',
                'boardSkin' => 'nullable|string'
            ]);

            $roomName = trim($request->input('roomName'));
            $userId = $request->input('userId');
            $password = $request->input('password');
            $isPrivate = $request->input('isPrivate', false);
            $boardSkin = $request->input('boardSkin', 'board_neon');

            // Conflict check
            $existing = LobbyRoom::where('room_name', $roomName)->where('status', '!=', 'finished')->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'error' => 'Nama room sudah terpakai!'
                ], 400);
            }

            $room = LobbyRoom::create([
                'id' => 'room_' . Str::random(8),
                'room_name' => $roomName,
                'password' => $password,
                'player1_id' => $userId,
                'player2_id' => null,
                'player1_ready' => false,
                'player2_ready' => false,
                'status' => 'waiting',
                'is_private' => $isPrivate,
                'board_skin' => $boardSkin
            ]);

            return response()->json([
                'success' => true,
                'room' => $room
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Join room
    public function join(Request $request)
    {
        try {
            $request->validate([
                'roomName' => 'required|string',
                'userId' => 'required',
                'password' => 'nullable|string'
            ]);

            $roomName = trim($request->input('roomName'));
            $userId = $request->input('userId');
            $password = $request->input('password');

            $room = LobbyRoom::where('room_name', $roomName)->where('status', '!=', 'finished')->first();
            if (!$room) {
                return response()->json([
                    'success' => false,
                    'error' => 'Room tidak ditemukan!'
                ], 404);
            }

            if ($room->status === 'playing' || $room->status === 'finished' || ($room->player2_id && $room->player1_id != $userId && $room->player2_id != $userId)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ruangan sudah penuh atau sedang bermain!'
                ], 400);
            }

            if ($room->player1_id != $userId) {
                if ($room->is_private && $room->password && $room->password !== $password) {
                    return response()->json([
                        'success' => false,
                        'error' => 'Password salah!'
                    ], 400);
                }

                $room->update([
                    'player2_id' => $userId,
                    'status' => 'full'
                ]);
            }

            return response()->json([
                'success' => true,
                'room' => $room
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Matchmaking automated dispatcher
    public function queue(Request $request)
    {
        try {
            $request->validate([
                'userId' => 'required',
                'boardSkin' => 'nullable|string'
            ]);

            $userId = $request->input('userId');
            $boardSkin = $request->input('boardSkin', 'board_neon');

            // Find public waiting room hosted by another player
            $openRoom = LobbyRoom::where('is_private', false)
                ->where('status', 'waiting')
                ->where('player1_id', '!=', $userId)
                ->first();

            if ($openRoom) {
                $openRoom->update([
                    'player2_id' => $userId,
                    'status' => 'full'
                ]);
                return response()->json([
                    'success' => true,
                    'room' => $openRoom,
                    'role' => 'p2'
                ]);
            }

            // Create new random lobby
            $randomName = 'QuickMatch_' . strtoupper(Str::random(4));
            $room = LobbyRoom::create([
                'id' => 'room_' . Str::random(8),
                'room_name' => $randomName,
                'player1_id' => $userId,
                'player2_id' => null,
                'player1_ready' => false,
                'player2_ready' => false,
                'status' => 'waiting',
                'is_private' => false,
                'board_skin' => $boardSkin
            ]);

            return response()->json([
                'success' => true,
                'room' => $room,
                'role' => 'p1'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
