<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexLeaveBalanceRequest;
use App\Http\Resources\LeaveBalanceResource;
use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LeaveBalanceController extends Controller
{
    /**
     * Show the leave balance for a given user/year.
     *
     * Defaults to the current user and current year. Viewing another user's
     * balance requires that user to be inside the caller's team scope.
     */
    public function show(IndexLeaveBalanceRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $targetId = isset($validated['user_id'])
            ? (int) $validated['user_id']
            : $user->id;

        $year = isset($validated['year'])
            ? (int) $validated['year']
            : (int) now()->year;

        // teamIds() always contains the user's own id, so this also covers
        // the default (self) case.
        if (! in_array($targetId, $user->teamIds())) {
            return response()->json([
                'message' => 'Không có quyền xem số dư phép của nhân viên này',
            ], 403);
        }

        $balance = LeaveBalance::for(User::findOrFail($targetId), $year);

        return response()->json([
            'data' => new LeaveBalanceResource($balance),
        ]);
    }
}
