<?php

use App\Http\Controllers\LeaveBalanceController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LeaveBalanceController::class, 'show'])->name('show');
