<?php

namespace App\Services;

use App\Constants\AppConstants;
use App\Exceptions\ForbiddenException;
use App\Models\Attendance;
use App\Models\User;
use App\Support\DateHelper;
use Illuminate\Support\Collection;
use Throwable;

class AttendanceService
{
    /**
     * Monthly attendances + summary scoped to the viewer's team.
     *
     * @return array{items: Collection<int, Attendance>, summary: array{days: int, total_hours: float, late_days: int}}
     */
    public function monthlyData(User $viewer, ?string $month, ?int $userId): array
    {
        [$start, $end] = DateHelper::monthRange($month);

        $allowedIds = array_map('intval', $viewer->teamIds());

        if ($userId !== null) {
            if (! in_array($userId, $allowedIds, true)) {
                throw new ForbiddenException(__('messages.attendance.forbidden_view'));
            }

            $userIds = [$userId];
        } else {
            $userIds = $allowedIds;
        }

        $fetch = fn () => Attendance::with('user:id,name')
            ->forUsers($userIds)
            ->betweenDates($start, $end)
            ->orderBy('date')
            ->orderBy('user_id')
            ->get();

        $items = $fetch();

        // No records and no Connecteam configured -> generate demo data so
        // the attendance page is never empty, then re-query.
        if ($items->isEmpty() && empty(config('services.connecteam.api_key'))) {
            try {
                app(ConnecteamService::class)->sync(60); // falls back to demo data
            } catch (Throwable) {
                // Demo generation failed — continue and return empty data.
            }

            $items = $fetch();
        }

        return [
            'items' => $items,
            'summary' => [
                'days' => $items->count(),
                'total_hours' => round((float) $items->sum('work_hours'), 2),
                'late_days' => $items->filter(
                    fn (Attendance $a) => $a->check_in && $a->check_in->format('H:i') > AppConstants::WORK_START
                )->count(),
            ],
        ];
    }

    /**
     * Sync attendance records from Connecteam (or demo data when unconfigured).
     */
    public function sync(): int
    {
        return app(ConnecteamService::class)->sync();
    }
}
