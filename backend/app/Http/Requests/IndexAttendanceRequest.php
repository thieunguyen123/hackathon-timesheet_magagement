<?php

namespace App\Http\Requests;

class IndexAttendanceRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
