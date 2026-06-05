<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@nexkey.com'],
            [
                'username' => 'AdminCore',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'level' => 5,
                'exp' => 250,
                'max_exp' => 1000,
                'currency' => 1200,
                'active_paddle_skin' => 'paddle_cyan',
                'active_board_skin' => 'board_neon',
                'is_banned' => false,
                'created_at' => now(),
                'updated_at' => now(),
                'bio' => 'Central Grid Administrator. Compiling the Nexkey system matrices.',
                'avatar_url' => 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Admin'
            ]
        );
    }
}
