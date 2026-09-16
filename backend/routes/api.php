<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/attendances', [AttendanceController::class, 'index']);
    Route::post('/attendances/sync', [AttendanceController::class, 'sync'])->middleware('role:admin,manager');

    Route::get('/requests', [LeaveRequestController::class, 'index']);
    Route::post('/requests', [LeaveRequestController::class, 'store']);
    Route::post('/requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->middleware('role:admin,manager');
    Route::post('/requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->middleware('role:admin,manager');

    Route::get('/leave-balance', [LeaveBalanceController::class, 'show']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/team/users', [UserController::class, 'team'])->middleware('role:admin,manager');

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('export/timesheet', [ExportController::class, 'timesheet']);
        Route::get('export/requests', [ExportController::class, 'requests']);
    });
});
