<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexLeaveRequestRequest;
use App\Http\Requests\RejectLeaveRequestRequest;
use App\Http\Requests\StoreLeaveRequestRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LeaveRequestController extends Controller
{
    public function __construct(private LeaveRequestService $leaveRequestService) {}

    /**
     * List leave requests visible to the current user.
     * ?all=1 skips pagination.
     */
    public function index(IndexLeaveRequestRequest $request): AnonymousResourceCollection
    {
        $query = $this->leaveRequestService->queryFor($request->user(), $request->validated());

        return LeaveRequestResource::collection(
            $request->boolean('all') ? $query->get() : $query->paginate(15)
        );
    }

    /**
     * Create a new leave request (status: pending) and notify Slack.
     */
    public function store(StoreLeaveRequestRequest $request): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->create($request->user(), $request->validated());

        return ApiResponse::created(
            new LeaveRequestResource($leaveRequest),
            __('messages.leave_request.created'),
        );
    }

    /**
     * Approve a pending request.
     */
    public function approve(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->approve($request->user(), $leaveRequest);

        return ApiResponse::success(
            new LeaveRequestResource($leaveRequest),
            __('messages.leave_request.approved'),
        );
    }

    /**
     * Reject a pending request with a mandatory reason.
     */
    public function reject(RejectLeaveRequestRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->reject(
            $request->user(),
            $leaveRequest,
            (string) $request->validated('reject_reason'),
        );

        return ApiResponse::success(
            new LeaveRequestResource($leaveRequest),
            __('messages.leave_request.rejected'),
        );
    }
}
