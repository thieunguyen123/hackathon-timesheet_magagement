<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class LeaveAccrualService
{
    /**
     * Gender-based annual leave entitlement for a given year.
     *
     * entitlement = min(cap, monthsWorked * monthlyRate), rounded to 1 decimal.
     * monthsWorked = months between the user's start_date and the end of the
     * accrual year (or today when today is earlier), minimum 1.
     */
    public function entitlement(User $user, ?int $year = null): float
    {
        $year = $year ?? (int) now()->year;

        $cap = $user->annualLeaveCap();
        $rate = $user->monthlyLeaveRate();

        $months = $this->monthsWorked($user, $year);

        $entitlement = min($cap, $months * $rate);

        return round(max(0.0, $entitlement), 1);
    }

    /**
     * Months worked within the accrual year, minimum 1.
     * Falls back to 1 month when the user has no start_date.
     */
    private function monthsWorked(User $user, int $year): int
    {
        if (! $user->start_date) {
            return 1;
        }

        // Accrue through the end of the accrual year, or today when today is earlier.
        $accrueThrough = Carbon::create($year, 12, 31)->endOfDay();
        $today = now();

        if ($today->lt($accrueThrough)) {
            $accrueThrough = $today;
        }

        $start = $user->start_date->copy()->startOfMonth();

        if ($start->greaterThan($accrueThrough)) {
            return 1;
        }

        return max(1, (int) $start->diffInMonths($accrueThrough) + 1);
    }
}
