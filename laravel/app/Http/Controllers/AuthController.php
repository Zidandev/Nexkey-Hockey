<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PlayerStat;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // Retrieve all profile matrices on the grid
    public function profiles()
    {
        try {
            $users = User::all();
            return $this->jsonResponse([
                'success' => true,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Traditional V1 Registration Fallback
    public function register(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'email' => 'nullable|email'
            ]);

            $username = trim($request->input('username'));
            $email = trim($request->input('email')) ?: "{$username}@nexkey.dev";

            $existing = User::where('username', $username)->first();
            if ($existing) {
                return $this->jsonResponse([
                    'success' => true,
                    'user' => $existing,
                    'message' => 'Welcome back!'
                ]);
            }

            $user = DB::transaction(function () use ($username, $email) {
                $u = User::create([
                    'username' => $username,
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role' => 'player',
                    'level' => 1,
                    'exp' => 0,
                    'max_exp' => 100,
                    'currency' => 100,
                    'active_paddle_skin' => 'paddle_cyan',
                    'active_board_skin' => 'board_neon',
                    'is_banned' => false,
                    'bio' => 'High frequency operator.',
                    'avatar_url' => "https://api.dicebear.com/7.x/bottts-neutral/svg?seed={$username}"
                ]);

                // Seed relation records
                PlayerStat::create([
                    'user_id' => $u->id,
                    'total_matches' => 0,
                    'total_wins' => 0,
                    'total_losses' => 0,
                    'win_rate' => 0
                ]);

                Inventory::create(['user_id' => $u->id, 'item_id' => 'paddle_cyan']);
                Inventory::create(['user_id' => $u->id, 'item_id' => 'board_neon']);

                return $u;
            });

            return $this->jsonResponse([
                'success' => true,
                'user' => $user,
                'message' => 'Account created!'
            ], 201);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Step 1: E-Sports Simple Email registration
    public function registerSimple(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            $email = trim($request->input('email'));
            $password = $request->input('password');

            $existing = User::where('email', $email)->first();
            if ($existing) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Email address already mapped to an active synapse.'
                ], 400);
            }

            $user = DB::transaction(function () use ($email, $password) {
                // Initialize user with empty username to prompt name onboarding
                $u = User::create([
                    'username' => '',
                    'email' => $email,
                    'password' => Hash::make($password),
                    'role' => 'player',
                    'level' => 1,
                    'exp' => 0,
                    'max_exp' => 100,
                    'currency' => 100,
                    'active_paddle_skin' => 'paddle_cyan',
                    'active_board_skin' => 'board_neon',
                    'is_banned' => false,
                    'avatar_url' => 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Operator'
                ]);

                PlayerStat::create([
                    'user_id' => $u->id,
                    'total_matches' => 0,
                    'total_wins' => 0,
                    'total_losses' => 0,
                    'win_rate' => 0
                ]);

                Inventory::create(['user_id' => $u->id, 'item_id' => 'paddle_cyan']);
                Inventory::create(['user_id' => $u->id, 'item_id' => 'board_neon']);

                return $u;
            });

            return $this->jsonResponse([
                'success' => true,
                'user' => $user,
                'message' => 'Synapse account initiated. Enforcing username verification.'
            ], 201);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Step 1: Login using password credentials
    public function loginSimple(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string'
            ]);

            $email = trim($request->input('email'));
            $password = $request->input('password');

            $user = User::where('email', $email)->first();
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Unrecognized user email synapse address.'
                ], 404);
            }

            // Simple preview/sandbox credential evaluation checks:
            if (!Hash::check($password, $user->password)) {
                // Admin sandbox password override fallback support
                if ($email === 'admin@nexkey.com' && $password === 'password123') {
                    // Allowed
                } else {
                    return $this->jsonResponse([
                        'success' => false,
                        'error' => 'Invalid decryption key hexcode. Try: password123'
                    ], 401);
                }
            }

            return $this->jsonResponse([
                'success' => true,
                'user' => $user,
                'message' => 'Decryption verified.'
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Step 2: Onboarding Username configuration
    public function setUsername(Request $request)
    {
        try {
            $request->validate([
                'userId' => 'required',
                'username' => 'required|string'
            ]);

            $userId = $request->input('userId');
            $username = trim($request->input('username'));

            if (!preg_match('/^[a-zA-Z0-9]{3,15}$/', $username)) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Username must be alphanumeric, between 3 and 15 characters.'
                ], 400);
            }

            $userWithSameName = User::where('username', $username)->first();
            if ($userWithSameName && $userWithSameName->id !== $userId) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Username coordinate registered elsewhere on the grid.'
                ], 400);
            }

            $user = User::find($userId);
            if (!$user) {
                return $this->jsonResponse([
                    'success' => false,
                    'error' => 'Node context match not found.'
                ], 404);
            }

            $user->update([
                'username' => $username,
                'avatar_url' => $user->avatar_url ?: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed={$username}"
            ]);

            return $this->jsonResponse([
                'success' => true,
                'user' => $user,
                'message' => 'Username successfully registered to current synapse!'
            ]);

        } catch (\Exception $e) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
