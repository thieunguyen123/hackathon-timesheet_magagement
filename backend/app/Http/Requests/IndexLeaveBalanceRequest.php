<?php

namespace App\Http\Requests;

class IndexLeaveBalanceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ];
    }
}
