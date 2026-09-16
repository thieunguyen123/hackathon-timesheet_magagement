<?php

namespace Database\Seeders;

use App\Constants\AppConstants;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoAttendanceSeeder extends Seeder
{
    /**
     * Deterministic demo attendance for the last 60 days (weekdays only).
     *
     * Idempotent: rows are keyed on (user_id, date) via updateOrCreate, and
     * rows imported from real sources ('connecteam', 'machine') are never
     * overwritten.
     */
    public function run(): void
    {
        $today = now()->startOfDay();

        foreach (User::all() as $user) {
            for ($i = 0; $i < 60; $i++) {
                $date = $today->copy()->subDays($i);

                // Weekdays only, never in the future.
                if ($date->isWeekend() || $date->gt($today)) {
                    continue;
                }

                // Never touch rows synced from real sources.
                $source = Attendance::where('user_id', $user->id)
                    ->where('date', $date->toDateString())
                    ->value('source');

                if (in_array($source, [AppConstants::SOURCE_CONNECTEAM, 'machine'], true)) {
                    continue;
                }

                // Deterministic pseudo-random times seeded by (user, date).
                $seed = crc32($user->id.'|'.$date->toDateString());
                $checkIn = $date->copy()->setTime(7, 30)->addMinutes($seed % 101); // 07:30–09:10
                $workedMinutes = 420 + intdiv($seed, 101) % 121; // 7.0–9.0 hours
                $checkOut = $checkIn->copy()->addMinutes($workedMinutes);

                Attendance::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $date->toDateString()],
                    [
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'work_hours' => round($workedMinutes / 60, 2),
                        'source' => AppConstants::SOURCE_DEMO,
                    ]
                );
            }
        }
    }
}
