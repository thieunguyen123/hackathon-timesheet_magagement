<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about:timesheet', function () {
    $this->info('Timesheet management API');
});
