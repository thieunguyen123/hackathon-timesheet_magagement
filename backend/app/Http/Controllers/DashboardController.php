<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    /**
     * GET /api/dashboard/stats
     * Payload được scope theo role của user hiện tại.
     */
    public function stats(Request $request): JsonResponse
    {
        return ApiResponse::success($this->dashboardService->statsFor($request->user()));
    }
}
