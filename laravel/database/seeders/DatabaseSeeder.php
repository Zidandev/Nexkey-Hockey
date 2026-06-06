<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // 1. Seed shop items
        $shopItems = [
            [
                'id' => 'paddle_cyan',
                'name' => 'Cyan Flare Paddle',
                'category' => 'paddle',
                'cost' => 0,
                'style_value' => '#00ffff',
                'description' => 'Default glowing cyan paddle.',
                'unlocked_by_default' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'paddle_green',
                'name' => 'Green Matrix Paddle',
                'category' => 'paddle',
                'cost' => 150,
                'style_value' => '#39ff14',
                'description' => 'Glowing retro matrix neon green paddle.',
                'unlocked_by_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'paddle_purple',
                'name' => 'Purple Nebula Paddle',
                'category' => 'paddle',
                'cost' => 300,
                'style_value' => '#bd00ff',
                'description' => 'Deep purple cosmic energy emission paddle.',
                'unlocked_by_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'paddle_crimson',
                'name' => 'Crimson Fire Paddle',
                'category' => 'paddle',
                'cost' => 500,
                'style_value' => '#ff003c',
                'description' => 'Fierce cybernetic plasma red paddle.',
                'unlocked_by_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'board_neon',
                'name' => 'Neon Grid Arena',
                'category' => 'board',
                'cost' => 0,
                'style_value' => 'grid',
                'description' => 'Default cybergrid neon playfield.',
                'unlocked_by_default' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'board_matrix',
                'name' => 'Cyber Matrix Arena',
                'category' => 'board',
                'cost' => 250,
                'style_value' => 'matrix',
                'description' => 'Chrono-digital rain backdrop with a toxic grid.',
                'unlocked_by_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'board_vapor',
                'name' => 'Vaporwave Dusk Arena',
                'category' => 'board',
                'cost' => 400,
                'style_value' => 'vaporwave',
                'description' => 'Retro synthwave aesthetic with a magenta grid.',
                'unlocked_by_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 'board_solar',
                'name' => 'Solar Flare Arena',
                'category' => 'board',
                'cost' => 600,
                'style_value' => 'solar',
                'description' => 'Thermal solar flare overlay on obsidian grid.',
                'unlocked_by_default' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];

        foreach ($shopItems as $item) {
            DB::table('shop_items')->updateOrInsert(['id' => $item['id']], $item);
        }

        // 2. Run Admin Seeder
        $this->call(AdminSeeder::class);

        // 3. Seed Player: NeonRider
        $playerEmail = 'rider@nexkey.dev';
        DB::table('users')->updateOrInsert(
            ['email' => $playerEmail],
            [
                'username' => 'NeonRider',
                'password' => Hash::make('password123'),
                'role' => 'player',
                'level' => 1,
                'exp' => 20,
                'max_exp' => 100,
                'currency' => 80,
                'active_paddle_skin' => 'paddle_cyan',
                'active_board_skin' => 'board_neon',
                'is_banned' => false,
                'created_at' => now(),
                'updated_at' => now(),
                'bio' => 'High-frequency drift competitor. Speed of light reflexes.',
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=NeonRider'
            ]
        );

        $player = DB::table('users')->where('email', $playerEmail)->first();

        if ($player) {
            // Seed Relations for Player
            DB::table('player_stats')->updateOrInsert(
                ['user_id' => $player->id],
                [
                    'total_matches' => 3,
                    'total_wins' => 1,
                    'total_losses' => 2,
                    'win_rate' => 33,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            DB::table('user_inventories')->updateOrInsert(
                ['user_id' => $player->id, 'item_id' => 'paddle_cyan'],
                ['created_at' => now(), 'updated_at' => now()]
            );

            DB::table('user_inventories')->updateOrInsert(
                ['user_id' => $player->id, 'item_id' => 'board_neon'],
                ['created_at' => now(), 'updated_at' => now()]
            );

            // Match histories seeds
            $match1Id = 'match_legacy_1';
            DB::table('match_histories')->updateOrInsert(
                ['id' => $match1Id],
                [
                    'user_id' => $player->id,
                    'opponent_name' => 'AI (Light)',
                    'mode' => 'ai',
                    'player_rank' => 'loss',
                    'score_self' => 3,
                    'score_opponent' => 5,
                    'exp_earned' => 10,
                    'currency_earned' => 10,
                    'played_at' => now()->subDay(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            $match2Id = 'match_legacy_2';
            DB::table('match_histories')->updateOrInsert(
                ['id' => $match2Id],
                [
                    'user_id' => $player->id,
                    'opponent_name' => 'AI (Light)',
                    'mode' => 'ai',
                    'player_rank' => 'win',
                    'score_self' => 5,
                    'score_opponent' => 2,
                    'exp_earned' => 25,
                    'currency_earned' => 30,
                    'played_at' => now()->subHours(12),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            $match3Id = 'match_legacy_3';
            DB::table('match_histories')->updateOrInsert(
                ['id' => $match3Id],
                [
                    'user_id' => $player->id,
                    'opponent_name' => 'AI (Medium)',
                    'mode' => 'ai',
                    'player_rank' => 'loss',
                    'score_self' => 1,
                    'score_opponent' => 5,
                    'exp_earned' => 10,
                    'currency_earned' => 10,
                    'played_at' => now()->subHours(2),
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

        // Also add inventories and stats for admin
        $admin = DB::table('users')->where('email', 'admin@nexkey.com')->first();
        if ($admin) {
            DB::table('player_stats')->updateOrInsert(
                ['user_id' => $admin->id],
                [
                    'total_matches' => 8,
                    'total_wins' => 6,
                    'total_losses' => 2,
                    'win_rate' => 75,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );

            DB::table('user_inventories')->updateOrInsert(
                ['user_id' => $admin->id, 'item_id' => 'paddle_cyan'],
                ['created_at' => now(), 'updated_at' => now()]
            );

            DB::table('user_inventories')->updateOrInsert(
                ['user_id' => $admin->id, 'item_id' => 'board_neon'],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
