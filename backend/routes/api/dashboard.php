<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('stats', [DashboardController::class, 'stats'])->name('stats');
