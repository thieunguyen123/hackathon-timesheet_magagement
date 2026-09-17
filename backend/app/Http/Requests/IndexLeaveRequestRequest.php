<?php

namespace App\Http\Requests;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use Illuminate\Validation\Rule;

class IndexLeaveRequestRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'type' => ['nullable', Rule::enum(RequestType::class)],
            'status' => ['nullable', Rule::enum(RequestStatus::class)],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'all' => ['nullable', 'boolean'],
        ];
    }
}
