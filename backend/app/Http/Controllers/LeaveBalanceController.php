<?php

namespace App\Http\Controllers;

use App\Exceptions\ForbiddenException;
use App\Http\Requests\IndexLeaveBalanceRequest;
use App\Http\Resources\LeaveBalanceResource;
use App\Models\LeaveBalance;
use App\Models\User;
use App\Support\ApiResponse;
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
            throw new ForbiddenException(__('messages.leave_balance.forbidden_view'));
        }

        $balance = LeaveBalance::for(User::findOrFail($targetId), $year);

        return ApiResponse::success(new LeaveBalanceResource($balance));
    }
}
