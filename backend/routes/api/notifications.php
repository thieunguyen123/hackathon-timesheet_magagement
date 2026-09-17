<?php

use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [NotificationController::class, 'index'])->name('index');
Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
Route::post('{id}/read', [NotificationController::class, 'markRead'])->name('read');
