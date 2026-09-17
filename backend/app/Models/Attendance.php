<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'work_hours',
        'source',
        'external_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'check_in' => 'datetime',
            'check_out' => 'datetime',
            'work_hours' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUsers(Builder $q, array $userIds): Builder
    {
        return $q->whereIn('user_id', $userIds);
    }

    public function scopeBetweenDates(Builder $q, CarbonInterface|string $start, CarbonInterface|string $end): Builder
    {
        return $q->whereBetween('date', [
            $start instanceof CarbonInterface ? $start->toDateString() : $start,
            $end instanceof CarbonInterface ? $end->toDateString() : $end,
        ]);
    }

    public function scopeToday(Builder $q): Builder
    {
        return $q->whereDate('date', today());
    }
}
