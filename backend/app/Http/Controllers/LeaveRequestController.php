<?php

namespace App\Http\Controllers;

use App\Http\Requests\IndexLeaveRequestRequest;
use App\Http\Requests\RejectLeaveRequestRequest;
use App\Http\Requests\StoreLeaveRequestRequest;
use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use App\Services\LeaveRequestService;
use Illuminate\Http\JsonResponse;
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

        return response()->json([
            'message' => 'Tạo đơn thành công',
            'data' => new LeaveRequestResource($leaveRequest),
        ], 201);
    }

    /**
     * Approve a pending request.
     */
    public function approve(LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest = $this->leaveRequestService->approve(request()->user(), $leaveRequest);

        return response()->json([
            'message' => 'Đã duyệt đơn',
            'data' => new LeaveRequestResource($leaveRequest),
        ]);
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

        return response()->json([
            'message' => 'Đã từ chối đơn',
            'data' => new LeaveRequestResource($leaveRequest),
        ]);
    }
}
