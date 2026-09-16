<?php

namespace App\Models;

use App\Services\LeaveAccrualService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'year',
        'total_days',
        'used_days',
    ];

    protected $appends = [
        'remaining',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'total_days' => 'float',
            'used_days' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function getRemainingAttribute(): float
    {
        return max(0, (float) $this->total_days - (float) $this->used_days);
    }

    public function scopeForYear(Builder $query, int $year): Builder
    {
        return $query->where('year', $year);
    }

    public static function for(User $user, int $year): LeaveBalance
    {
        $entitlement = app(LeaveAccrualService::class)->entitlement($user, $year);

        $balance = static::firstOrCreate(
            ['user_id' => $user->id, 'year' => $year],
            ['total_days' => $entitlement]
        );

        if ((float) $balance->total_days !== $entitlement) {
            $balance->total_days = $entitlement;
            $balance->save();
        }

        return $balance;
    }
}
