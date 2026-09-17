<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::middleware('auth:sanctum')->group(base_path('routes/api/auth.php'));
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('dashboard')->name('dashboard.')->group(base_path('routes/api/dashboard.php'));
    Route::prefix('attendances')->name('attendances.')->group(base_path('routes/api/attendances.php'));
    Route::prefix('requests')->name('requests.')->group(base_path('routes/api/requests.php'));
    Route::prefix('leave-balance')->name('leave-balance.')->group(base_path('routes/api/leave-balance.php'));
    Route::prefix('notifications')->name('notifications.')->group(base_path('routes/api/notifications.php'));
    Route::prefix('team')->name('team.')->group(base_path('routes/api/team.php'));
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(base_path('routes/api/admin.php'));
});
