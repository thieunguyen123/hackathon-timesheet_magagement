<?php

namespace App\Services;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\User;
use App\Notifications\LeaveRequestApproved;
use App\Notifications\LeaveRequestRejected;
use App\Notifications\LeaveRequestSubmitted;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Throwable;

class LeaveRequestService
{
    /**
     * Query of leave requests visible to the viewer.
     *
     * Admins see everything, managers see their team, users see their own.
     * Supported filters: type, status, user_id (must be inside team scope).
     */
    public function queryFor(User $viewer, array $filters): Builder
    {
        $allowedIds = $viewer->teamIds();

        if (empty($allowedIds)) {
            $allowedIds = [$viewer->id];
        }

        $userId = isset($filters['user_id']) ? (int) $filters['user_id'] : null;

        if ($userId !== null && ! in_array($userId, $allowedIds)) {
            abort(403, 'Không có quyền xem đơn của nhân viên này');
        }

        $query = LeaveRequest::with(['user:id,name,email', 'approver:id,name'])
            ->whereIn('user_id', $allowedIds)
            ->latest();

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query;
    }

    /**
     * Create a new leave request (status: pending), notify Slack and
     * send a database notification to the approvers (manager + admins).
     */
    public function create(User $user, array $data): LeaveRequest
    {
        $attributes = [
            'user_id' => $user->id,
            'type' => $data['type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'reason' => $data['reason'] ?? null,
            'status' => RequestStatus::Pending,
        ];

        // Time range is stored for every request type: required for OT,
        // optional for off/remote (partial-day). hours is taken verbatim for
        // OT; for other types it's derived from the time range when absent.
        if (! empty($data['start_time']) && ! empty($data['end_time'])) {
            $attributes['start_time'] = $data['start_time'];
            $attributes['end_time'] = $data['end_time'];
            $attributes['hours'] = $data['type'] === RequestType::Ot->value
                ? $data['hours']
                : ($data['hours'] ?? round((strtotime($data['end_time']) - strtotime($data['start_time'])) / 3600, 2));
        } elseif ($data['type'] === RequestType::Ot->value) {
            $attributes['hours'] = $data['hours'];
        }

        $leaveRequest = LeaveRequest::create($attributes);

        app(SlackService::class)->notifyNewRequest($leaveRequest->load('user'));

        try {
            $recipients = User::where('role', 'admin')->get();

            if ($manager = $leaveRequest->user->manager) {
                $recipients->push($manager);
            }

            $recipients = $recipients->unique('id')->where('id', '!=', $user->id);

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new LeaveRequestSubmitted($leaveRequest));
            }
        } catch (Throwable $e) {
            Log::warning('Leave request submitted notification failed: '.$e->getMessage());
        }

        return $leaveRequest;
    }

    /**
     * Approve a pending request. For off-type requests the leave balance
     * used_days is incremented by the number of weekdays, atomically.
     */
    public function approve(User $actor, LeaveRequest $leaveRequest): LeaveRequest
    {
        $this->authorizeAction($actor, $leaveRequest);

        DB::transaction(function () use ($actor, $leaveRequest) {
            $leaveRequest->update([
                'status' => RequestStatus::Approved,
                'approved_by' => $actor->id,
                'approved_at' => now(),
            ]);

            if ($leaveRequest->type === RequestType::Off) {
                LeaveBalance::for(
                    $leaveRequest->user,
                    $leaveRequest->start_date->year
                )->increment('used_days', $leaveRequest->totalDays());
            }
        });

        try {
            $leaveRequest->user->notify(new LeaveRequestApproved($leaveRequest));
        } catch (Throwable $e) {
            Log::warning('Leave request approved notification failed: '.$e->getMessage());
        }

        return $leaveRequest->fresh(['user:id,name,email', 'approver:id,name']);
    }

    /**
     * Reject a pending request with a mandatory reason.
     */
    public function reject(User $actor, LeaveRequest $leaveRequest, string $reason): LeaveRequest
    {
        $this->authorizeAction($actor, $leaveRequest);

        $leaveRequest->update([
            'status' => RequestStatus::Rejected,
            'reject_reason' => $reason,
        ]);

        try {
            $leaveRequest->user->notify(new LeaveRequestRejected($leaveRequest));
        } catch (Throwable $e) {
            Log::warning('Leave request rejected notification failed: '.$e->getMessage());
        }

        return $leaveRequest->fresh(['user:id,name,email', 'approver:id,name']);
    }

    /**
     * Shared authorization for approve/reject.
     */
    private function authorizeAction(User $actor, LeaveRequest $leaveRequest): void
    {
        if ($leaveRequest->user_id === $actor->id) {
            abort(403, 'Không thể tự duyệt đơn của mình');
        }

        $allowed = $actor->isAdmin()
            || ($actor->isManager() && in_array($leaveRequest->user_id, $actor->teamIds()));

        if (! $allowed) {
            abort(403, 'Không có quyền duyệt đơn này');
        }

        if (! $leaveRequest->isPending()) {
            abort(422, 'Đơn đã được xử lý');
        }
    }
}
