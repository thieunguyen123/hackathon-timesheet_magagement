<?php

namespace App\Http\Requests;

class RejectLeaveRequestRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'reject_reason' => ['required', 'string', 'max:500'],
        ];
    }
}
