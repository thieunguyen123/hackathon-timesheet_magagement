<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::apiResource('users', UserController::class);

Route::prefix('export')->name('export.')->group(function () {
    Route::get('timesheet', [ExportController::class, 'timesheet'])->name('timesheet');
    Route::get('requests', [ExportController::class, 'requests'])->name('requests');
});
