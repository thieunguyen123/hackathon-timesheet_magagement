<?php

namespace App\Http\Requests;

class ExportTimesheetRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
        ];
    }
}
