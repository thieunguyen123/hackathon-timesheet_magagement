<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexLeaveBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2100'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.exists' => 'Nhân viên không tồn tại.',
            'integer' => ':attribute phải là số nguyên.',
            'year.min' => 'Năm phải từ :min trở lên.',
            'year.max' => 'Năm không được vượt quá :max.',
        ];
    }
}
