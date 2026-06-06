<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Exclude api routes from intercepting so Laravel's api.php can handle them
Route::get('/{any?}', function ($any = null) {
    // Serving index.html from Laravel public path
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    
    // Beautiful offline dashboard explaining why they need to build assets
    return view('welcome');
})->where('any', '^(?!api).*');
