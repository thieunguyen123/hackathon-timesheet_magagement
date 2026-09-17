<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\AttendanceService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function __construct(private AttendanceService $attendanceService) {}

    public function index(IndexAttendanceRequest $request): JsonResponse
    {
        $result = $this->attendanceService->monthlyData(
            $request->user(),
            $request->input('month'),
            $request->filled('user_id') ? (int) $request->input('user_id') : null,
        );

        return ApiResponse::success(
            AttendanceResource::collection($result['items']),
            extra: ['summary' => $result['summary']],
        );
    }

    public function sync(): JsonResponse
    {
        return ApiResponse::message(
            __('messages.attendance.sync_success'),
            ['synced' => $this->attendanceService->sync()],
        );
    }
}
