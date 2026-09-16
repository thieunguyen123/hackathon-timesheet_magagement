<?php

namespace App\Services;

use App\Constants\AppConstants;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class UserService
{
    /**
     * Paginated employee list (admin), supports role + q (name/email) filters.
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        return User::with('manager:id,name')
            ->when($filters['role'] ?? null, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($filters['q'] ?? null, function ($query, $term) {
                $query->where(function ($sub) use ($term) {
                    $sub->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->orderBy('name')
            ->paginate(15);
    }

    /**
     * Create a user with hashed password and default annual leave days.
     * The annual leave default follows the gender cap (female 18, male 12).
     */
    public function create(array $data): User
    {
        $isFemale = ($data['gender'] ?? 'male') === 'female';

        return User::create([
            ...$data,
            'password' => Hash::make($data['password']),
            'annual_leave_days' => $data['annual_leave_days']
                ?? ($isFemale ? AppConstants::FEMALE_ANNUAL_LEAVE : AppConstants::MALE_ANNUAL_LEAVE),
        ]);
    }

    /**
     * Update a user. Password is only updated when provided.
     */
    public function update(User $actor, User $target, array $data): User
    {
        $currentRole = $target->role instanceof Role ? $target->role->value : $target->role;

        if ($target->id === $actor->id && isset($data['role']) && $data['role'] !== $currentRole) {
            abort(422, 'Không thể đổi quyền của chính mình');
        }

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $target->update($data);

        return $target->fresh();
    }

    /**
     * Delete a user. An actor cannot delete themselves.
     */
    public function delete(User $actor, User $target): void
    {
        if ($target->id === $actor->id) {
            abort(422, 'Không thể xóa chính mình');
        }

        $target->delete();
    }

    /**
     * Team listing: admins get everyone, managers get subordinates + self.
     */
    public function teamFor(User $user): Collection
    {
        $columns = ['id', 'name', 'email', 'role', 'manager_id'];

        if ($user->isAdmin()) {
            return User::orderBy('name')->get($columns);
        }

        if ($user->isManager()) {
            return $user->subordinates()
                ->orderBy('name')
                ->get($columns)
                ->push(User::whereKey($user->id)->first($columns))
                ->sortBy('name')
                ->values();
        }

        abort(403);
    }
}
