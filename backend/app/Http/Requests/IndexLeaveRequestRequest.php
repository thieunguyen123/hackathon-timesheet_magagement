<?php

namespace App\Http\Requests;

use App\Enums\RequestStatus;
use App\Enums\RequestType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['nullable', Rule::enum(RequestType::class)],
            'status' => ['nullable', Rule::enum(RequestStatus::class)],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'all' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.enum' => 'Loại đơn không hợp lệ.',
            'status.enum' => 'Trạng thái không hợp lệ.',
            'user_id.exists' => 'Nhân viên không tồn tại.',
            'boolean' => ':attribute phải là true hoặc false.',
        ];
    }
}
