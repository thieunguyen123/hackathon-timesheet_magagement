<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Latest 20 database notifications for the current user + unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->limit(20)
            ->get();

        return ApiResponse::success(
            NotificationResource::collection($notifications),
            extra: ['unread_count' => $user->unreadNotifications()->count()],
        );
    }

    /**
     * Unread notification count for the current user (bell badge).
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return ApiResponse::success(extra: [
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return ApiResponse::success(extra: ['ok' => true]);
    }

    /**
     * Mark all of the current user's unread notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return ApiResponse::success(extra: ['ok' => true]);
    }
}
