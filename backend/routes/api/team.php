<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('users', [UserController::class, 'team'])
    ->middleware('role:admin,manager')
    ->name('users');
