<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
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
        return response()->json([
            'data' => $this->dashboardService->statsFor($request->user()),
        ]);
    }
}
