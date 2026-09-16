<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Idempotent: safe to run `migrate --seed` multiple times.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@timesheet.dev'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => Role::Admin,
                'gender' => 'male',
                'start_date' => Carbon::now()->subMonths(24)->toDateString(),
                'email_verified_at' => now(),
                'annual_leave_days' => 12,
            ]
        );

        $manager = User::updateOrCreate(
            ['email' => 'manager@timesheet.dev'],
            [
                'name' => 'Quản lý',
                'password' => Hash::make('password'),
                'role' => Role::Manager,
                'gender' => 'female',
                'start_date' => Carbon::now()->subMonths(14)->toDateString(),
                'email_verified_at' => now(),
                'annual_leave_days' => 18,
            ]
        );

        $staff = [];

        // user1 male / user2 female / user3 male / user4 female, varied tenure.
        $staffMeta = [
            1 => ['gender' => 'male', 'months' => 6],
            2 => ['gender' => 'female', 'months' => 3],
            3 => ['gender' => 'male', 'months' => 10],
            4 => ['gender' => 'female', 'months' => 1],
        ];

        for ($i = 1; $i <= 4; $i++) {
            $staff[$i] = User::updateOrCreate(
                ['email' => "user{$i}@timesheet.dev"],
                [
                    'name' => "Nhân viên {$i}",
                    'password' => Hash::make('password'),
                    'role' => Role::User,
                    'gender' => $staffMeta[$i]['gender'],
                    'start_date' => Carbon::now()->subMonths($staffMeta[$i]['months'])->toDateString(),
                    'manager_id' => $manager->id,
                    'email_verified_at' => now(),
                    'annual_leave_days' => $staffMeta[$i]['gender'] === 'female' ? 18 : 12,
                ]
            );
        }

        // Ensure every seeded user has a leave balance row for the current year.
        foreach (array_merge([$admin, $manager], $staff) as $user) {
            LeaveBalance::for($user, now()->year);
        }

        // Sample leave requests for next week.
        $monday = now()->addWeek()->startOfWeek();
        $wednesday = $monday->copy()->addDays(2);
        $friday = $monday->copy()->addDays(4);
        $saturday = $monday->copy()->addDays(5);

        // user1: pending day off, next week Mon-Wed.
        LeaveRequest::firstOrCreate(
            [
                'user_id' => $staff[1]->id,
                'start_date' => $monday->toDateString(),
                'type' => 'off',
            ],
            [
                'end_date' => $wednesday->toDateString(),
                'status' => 'pending',
                'reason' => 'Việc gia đình',
            ]
        );

        // user2: approved remote day, next Friday.
        LeaveRequest::firstOrCreate(
            [
                'user_id' => $staff[2]->id,
                'start_date' => $friday->toDateString(),
                'type' => 'remote',
            ],
            [
                'end_date' => $friday->toDateString(),
                'status' => 'approved',
                'reason' => 'Làm việc từ xa',
                'approved_by' => $manager->id,
                'approved_at' => now(),
            ]
        );

        // user3: pending OT, next Saturday 09:00-13:00 (4 hours).
        LeaveRequest::firstOrCreate(
            [
                'user_id' => $staff[3]->id,
                'start_date' => $saturday->toDateString(),
                'type' => 'ot',
            ],
            [
                'end_date' => $saturday->toDateString(),
                'status' => 'pending',
                'hours' => 4,
                'start_time' => '09:00',
                'end_time' => '13:00',
                'reason' => 'Xử lý công việc tồn đọng',
            ]
        );

        // Demo attendance records (check-in/out timesheets) for seeded users.
        $this->call(DemoAttendanceSeeder::class);
    }
}
