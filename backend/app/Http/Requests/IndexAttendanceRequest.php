<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'month.date_format' => 'Tháng phải có định dạng Y-m.',
            'user_id.exists' => 'Nhân viên không tồn tại.',
            'integer' => ':attribute phải là số nguyên.',
        ];
    }
}
