<?php

namespace App\Models;

use App\Constants\AppConstants;
use App\Enums\Gender;
use App\Enums\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'gender',
        'start_date',
        'manager_id',
        'annual_leave_days',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'gender' => Gender::class,
            'password' => 'hashed',
            'role' => Role::class,
            'start_date' => 'date',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isManager(): bool
    {
        return $this->role === Role::Manager;
    }

    public function isFemale(): bool
    {
        return $this->gender === Gender::Female;
    }

    public function annualLeaveCap(): float
    {
        return $this->isFemale()
            ? AppConstants::FEMALE_ANNUAL_LEAVE
            : AppConstants::MALE_ANNUAL_LEAVE;
    }

    public function monthlyLeaveRate(): float
    {
        return $this->isFemale()
            ? AppConstants::FEMALE_LEAVE_RATE
            : AppConstants::MALE_LEAVE_RATE;
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role->value, $roles, true);
    }

    public function leaveBalanceFor(int $year): ?LeaveBalance
    {
        return $this->leaveBalances()->where('year', $year)->first();
    }

    public function teamIds(): array
    {
        if ($this->isAdmin()) {
            return static::query()->pluck('id')->all();
        }

        if ($this->isManager()) {
            return $this->subordinates()
                ->pluck('id')
                ->push($this->id)
                ->all();
        }

        return [$this->id];
    }

    public function scopeRole(Builder $query, Role|string $role): Builder
    {
        return $query->where('role', $role instanceof Role ? $role->value : $role);
    }

    public function scopeAdmins(Builder $query): Builder
    {
        return $this->scopeRole($query, Role::Admin);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if ($term === null || trim($term) === '') {
            return $query;
        }

        $like = '%'.trim($term).'%';

        return $query->where(function (Builder $q) use ($like) {
            $q->where('name', 'like', $like)
                ->orWhere('email', 'like', $like);
        });
    }
}
