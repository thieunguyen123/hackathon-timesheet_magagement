<?php

namespace App\Http\Requests;

use App\Enums\RequestStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportRequestsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
            'status' => ['nullable', Rule::enum(RequestStatus::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'month.date_format' => 'Tháng phải có định dạng Y-m.',
            'status.enum' => 'Trạng thái không hợp lệ.',
        ];
    }
}
