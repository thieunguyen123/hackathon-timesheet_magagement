<?php

use App\Http\Controllers\LeaveRequestController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LeaveRequestController::class, 'index'])->name('index');
Route::post('/', [LeaveRequestController::class, 'store'])->name('store');
Route::post('{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])
    ->middleware('role:admin,manager')
    ->name('approve');
Route::post('{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])
    ->middleware('role:admin,manager')
    ->name('reject');
