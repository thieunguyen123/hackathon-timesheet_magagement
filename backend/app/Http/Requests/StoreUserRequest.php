<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Validation\Rule;

class StoreUserRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::enum(Role::class)],
            'gender' => ['required', 'in:male,female'],
            'start_date' => ['required', 'date'],
            'manager_id' => ['nullable', 'integer', 'exists:users,id'],
            'annual_leave_days' => ['nullable', 'integer', 'min:0', 'max:60'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.date' => 'Ngày bắt đầu làm việc không hợp lệ.',
        ];
    }
}
