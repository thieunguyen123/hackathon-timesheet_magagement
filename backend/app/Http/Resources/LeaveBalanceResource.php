<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveBalanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'year' => (int) $this->year,
            'total_days' => (float) $this->total_days,
            'used_days' => (float) $this->used_days,
            'remaining' => (float) $this->remaining,
        ];
    }
}
