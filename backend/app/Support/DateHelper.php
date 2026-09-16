<?php

namespace App\Support;

use App\Constants\AppConstants;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Carbon\CarbonPeriod;
use Throwable;

class DateHelper
{
    /**
     * Count weekdays (Mon–Fri) between two dates, inclusive.
     *
     * Accepts Carbon instances or date strings in either order.
     */
    public static function weekdaysBetween(CarbonInterface|string $start, CarbonInterface|string $end): int
    {
        $start = $start instanceof CarbonInterface ? $start->copy()->startOfDay() : Carbon::parse($start)->startOfDay();
        $end = $end instanceof CarbonInterface ? $end->copy()->endOfDay() : Carbon::parse($end)->endOfDay();

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
        }

        $days = 0;

        foreach (CarbonPeriod::create($start, $end) as $date) {
            if ($date->isWeekday()) {
                $days++;
            }
        }

        return $days;
    }

    /**
     * Resolve a 'Y-m' month string into [startOfMonth, endOfMonth].
     * Invalid or null input falls back to the current month.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    public static function monthRange(?string $month): array
    {
        $start = null;

        if (is_string($month) && preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $month) === 1) {
            try {
                $start = Carbon::createFromFormat('Y-m', $month);
            } catch (Throwable) {
                $start = null;
            }
        }

        $start = ($start instanceof Carbon ? $start : Carbon::now())->startOfMonth();

        return [$start, $start->copy()->endOfMonth()];
    }

    /**
     * Minutes the check-in is after the scheduled work start (0 if on time).
     */
    public static function minutesLate(?CarbonInterface $checkIn, string $start = AppConstants::WORK_START): int
    {
        if ($checkIn === null) {
            return 0;
        }

        $scheduled = $checkIn->copy()->setTimeFromTimeString($start);

        return $checkIn->greaterThan($scheduled)
            ? (int) round($scheduled->diffInMinutes($checkIn))
            : 0;
    }

    /**
     * Minutes the check-out is before the scheduled work end (0 if not early).
     */
    public static function minutesEarly(?CarbonInterface $checkOut, string $end = AppConstants::WORK_END): int
    {
        if ($checkOut === null) {
            return 0;
        }

        $scheduled = $checkOut->copy()->setTimeFromTimeString($end);

        return $checkOut->lessThan($scheduled)
            ? (int) round($checkOut->diffInMinutes($scheduled))
            : 0;
    }
}
