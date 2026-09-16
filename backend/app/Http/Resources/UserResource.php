<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role instanceof \BackedEnum ? $this->role->value : $this->role,
            'role_label' => $this->role?->label(),
            'gender' => $this->gender,
            'gender_label' => $this->gender === 'female' ? 'Nữ' : 'Nam',
            'start_date' => $this->start_date?->format('Y-m-d'),
            'manager_id' => $this->manager_id,
            'annual_leave_days' => $this->annual_leave_days,
            'manager' => $this->whenLoaded('manager', fn () => $this->manager ? [
                'id' => $this->manager->id,
                'name' => $this->manager->name,
            ] : null),
            'leave_balances' => LeaveBalanceResource::collection($this->whenLoaded('leaveBalances')),
            'created_at' => $this->created_at,
        ];
    }
}
