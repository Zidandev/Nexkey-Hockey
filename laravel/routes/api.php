<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\GeminiController;
use App\Http\Controllers\AdminController;

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]);
});

// Authentication Routes
Route::get('/auth/profiles', [AuthController::class, 'profiles']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-simple', [AuthController::class, 'registerSimple']);
Route::post('/auth/login-simple', [AuthController::class, 'loginSimple']);
Route::post('/auth/set-username', [AuthController::class, 'setUsername']);

// User Profiles
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users/{id}/profile', [UserController::class, 'update']);

// Shop Catalog
Route::get('/shop/items', [ShopController::class, 'index']);
Route::post('/shop/purchase', [ShopController::class, 'purchase']);
Route::post('/shop/equip', [ShopController::class, 'equip']);

// Match records
Route::post('/match/add', [MatchController::class, 'store']);

// Gemini AI Slang Dialogue
Route::post('/gemini/dialogue', [GeminiController::class, 'generateDialogue']);

// Multiplayer Rooms
Route::get('/multiplayer/rooms', [RoomController::class, 'index']);
Route::post('/multiplayer/rooms/create', [RoomController::class, 'create']);
Route::post('/multiplayer/rooms/join', [RoomController::class, 'join']);
Route::post('/multiplayer/rooms/queue', [RoomController::class, 'queue']);

// Admin Command Panel
Route::get('/admin/players', [AdminController::class, 'players']);
Route::post('/admin/players/{id}', [AdminController::class, 'updatePlayer']);
Route::delete('/admin/players/{id}', [AdminController::class, 'deletePlayer']);
Route::get('/admin/stats', [AdminController::class, 'serverStats']);
