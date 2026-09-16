<?php

namespace App\Models;

use App\Constants\AppConstants;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'hours',
        'reason',
        'status',
        'approved_by',
        'approved_at',
        'reject_reason',
    ];

    protected function casts(): array
    {
        return [
            'type' => RequestType::class,
            'status' => RequestStatus::class,
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'approved_at' => 'datetime',
            'hours' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Count of weekdays (Mon–Fri) between start_date and end_date, inclusive.
     * When a time range is set the request is partial-day: each weekday counts
     * as hours/STANDARD_HOURS of a day (capped at 1).
     */
    public function totalDays(): float
    {
        $days = 0;

        foreach (CarbonPeriod::create($this->start_date, $this->end_date) as $date) {
            if (! $date->isWeekend()) {
                $days++;
            }
        }

        if ($days > 0 && $this->start_time && $this->end_time) {
            $hours = $this->hours ?? round(
                (strtotime((string) $this->end_time) - strtotime((string) $this->start_time)) / 3600,
                2
            );
            $fraction = min(max((float) $hours, 0), AppConstants::STANDARD_HOURS) / AppConstants::STANDARD_HOURS;

            return round($days * $fraction, 2);
        }

        return (float) $days;
    }

    public function isPending(): bool
    {
        return $this->status === RequestStatus::Pending;
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', RequestStatus::Pending->value);
    }
}
