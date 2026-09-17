<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::get('/', [AttendanceController::class, 'index'])->name('index');
Route::post('sync', [AttendanceController::class, 'sync'])
    ->middleware('role:admin,manager')
    ->name('sync');
