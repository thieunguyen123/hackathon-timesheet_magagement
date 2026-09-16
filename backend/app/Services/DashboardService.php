<?php

namespace App\Services;

use App\Enums\RequestStatus;
use App\Enums\Role;
use App\Models\Attendance;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\User;

class DashboardService
{
    /**
     * Dashboard stats payload scoped by the user's role.
     *
     * Base: month_hours, month_days, pending_requests, leave_remaining.
     * Manager adds: team_size, team_pending.
     * Admin adds: total_users, total_managers, today_present, pending_total,
     * requests_by_status (zero-filled per status).
     */
    public function statsFor(User $user): array
    {
        $now = now();

        $data = [
            'month_hours' => (float) $user->attendances()
                ->whereYear('date', $now->year)
                ->whereMonth('date', $now->month)
                ->sum('work_hours'),
            'month_days' => $user->attendances()
                ->whereYear('date', $now->year)
                ->whereMonth('date', $now->month)
                ->count(),
            'pending_requests' => $user->leaveRequests()
                ->where('status', RequestStatus::Pending)
                ->count(),
            'leave_remaining' => LeaveBalance::for($user, $now->year)?->remaining ?? 0,
        ];

        if ($user->isManager()) {
            $subordinateIds = $user->subordinates()->pluck('id');

            $data['team_size'] = $subordinateIds->count();
            $data['team_pending'] = LeaveRequest::whereIn('user_id', $subordinateIds)
                ->where('status', RequestStatus::Pending)
                ->count();
        }

        if ($user->isAdmin()) {
            $byStatus = LeaveRequest::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->get()
                ->mapWithKeys(fn ($row) => [
                    ($row->status instanceof \BackedEnum ? $row->status->value : $row->status) => (int) $row->total,
                ]);

            $data['total_users'] = User::count();
            $data['total_managers'] = User::where('role', Role::Manager)->count();
            $data['today_present'] = Attendance::whereDate('date', today())->count();
            $data['pending_total'] = LeaveRequest::where('status', RequestStatus::Pending)->count();
            $data['requests_by_status'] = [
                'pending' => (int) ($byStatus['pending'] ?? 0),
                'approved' => (int) ($byStatus['approved'] ?? 0),
                'rejected' => (int) ($byStatus['rejected'] ?? 0),
            ];
        }

        return $data;
    }
}
