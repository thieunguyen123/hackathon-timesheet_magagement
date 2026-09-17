<?php

namespace App\Http\Requests;

use App\Enums\RequestStatus;
use Illuminate\Validation\Rule;

class ExportRequestsRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
            'status' => ['nullable', Rule::enum(RequestStatus::class)],
        ];
    }
}
