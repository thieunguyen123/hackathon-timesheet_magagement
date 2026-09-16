<?php

namespace App\Console\Commands;

use App\Services\ConnecteamService;
use Illuminate\Console\Command;

class SyncConnecteamAttendances extends Command
{
    protected $signature = 'connecteam:sync {--days=30}';

    protected $description = 'Đồng bộ dữ liệu chấm công từ Connecteam';

    public function handle(ConnecteamService $service): int
    {
        $synced = $service->sync((int) $this->option('days'));

        $this->info("Synced {$synced} attendance records");

        return self::SUCCESS;
    }
}
