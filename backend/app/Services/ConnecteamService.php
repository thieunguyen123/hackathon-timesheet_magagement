<?php

namespace App\Services;

use App\Constants\AppConstants;
use App\Exceptions\ExternalServiceException;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Throwable;

class ConnecteamService
{
    /**
     * Sync attendance records for the last $days days.
     * Falls back to generated demo data when no API key is configured.
     */
    public function sync(int $days = 30): int
    {
        if (empty(config('services.connecteam.api_key'))) {
            return $this->generateDemo($days);
        }

        return $this->pullFromApi($days);
    }

    /**
     * Generate deterministic-ish demo attendance for employees and managers.
     */
    protected function generateDemo(int $days): int
    {
        $count = 0;
        $users = User::whereIn('role', ['user', 'manager'])->get();

        for ($i = 0; $i < $days; $i++) {
            $date = now()->subDays($i);

            if ($date->isWeekend()) {
                continue; // skip Sat/Sun
            }

            foreach ($users as $user) {
                $checkIn = $date->copy()->setTime(8, 0)->addMinutes(rand(-20, 60));
                $workedMinutes = rand(480, 570);
                $checkOut = $checkIn->copy()->addMinutes($workedMinutes);
                $workHours = round(($workedMinutes - AppConstants::LUNCH_MINUTES) / 60, 2); // minus lunch break

                Attendance::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $date->toDateString()],
                    [
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'work_hours' => $workHours,
                        'source' => AppConstants::SOURCE_DEMO,
                    ]
                );

                $count++;
            }
        }

        return $count;
    }

    /**
     * Pull real time activities from the Connecteam Time Clock API.
     */
    protected function pullFromApi(int $days): int
    {
        $config = config('services.connecteam');
        $baseUrl = rtrim($config['base_url'] ?? 'https://api.connecteam.com', '/');

        $response = Http::withHeaders([
            'X-API-KEY' => $config['api_key'],
            'accept' => 'application/json',
        ])->timeout(15)->get(
            $baseUrl.'/time-clock/v1/time-clocks/'.$config['timeclock_id'].'/time-activities',
            [
                'start_date' => now()->subDays($days)->toDateString(),
                'end_date' => now()->toDateString(),
            ]
        );

        if (! $response->successful()) {
            throw new ExternalServiceException(
                __('messages.integration.connecteam_error', ['status' => $response->status()])
            );
        }

        // NOTE: the exact payload shape should be verified against Connecteam API docs.
        // Expected: data.timeActivities[] items carrying the user (matched by email)
        // and a shift.activity[] list of segments with start/end unix timestamps.
        $activities = $response->json('data.timeActivities') ?? [];

        $count = 0;

        foreach ($activities as $activity) {
            try {
                $email = $activity['user']['email']
                    ?? $activity['userEmail']
                    ?? $activity['email']
                    ?? null;

                if (! $email) {
                    continue;
                }

                $user = User::where('email', $email)->first();
                if (! $user) {
                    continue;
                }

                $segments = $activity['shift']['activity'] ?? [];
                if (empty($segments)) {
                    continue;
                }

                $first = reset($segments);
                $last = end($segments);

                $clockInTs = $first['start']['timestamp'] ?? $first['start'] ?? null;
                $clockOutTs = $last['end']['timestamp'] ?? $last['end'] ?? null;

                if (! is_numeric($clockInTs)) {
                    continue;
                }

                $checkIn = Carbon::createFromTimestamp((int) $clockInTs)
                    ->setTimezone(config('app.timezone'));
                $checkOut = is_numeric($clockOutTs)
                    ? Carbon::createFromTimestamp((int) $clockOutTs)->setTimezone(config('app.timezone'))
                    : null;
                $workHours = $checkOut
                    ? round($checkIn->diffInMinutes($checkOut) / 60, 2)
                    : null;

                Attendance::updateOrCreate(
                    ['user_id' => $user->id, 'date' => $checkIn->toDateString()],
                    [
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'work_hours' => $workHours,
                        'source' => AppConstants::SOURCE_CONNECTEAM,
                        'external_id' => $activity['id'] ?? null,
                    ]
                );

                $count++;
            } catch (Throwable) {
                continue; // skip unmapped activities
            }
        }

        return $count;
    }
}
