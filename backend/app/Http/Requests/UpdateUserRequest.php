<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends BaseRequest
{
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', Rule::enum(Role::class)],
            'gender' => ['sometimes', 'required', 'in:male,female'],
            'start_date' => ['sometimes', 'required', 'date'],
            'manager_id' => ['nullable', 'integer', 'exists:users,id', 'not_in:'.$userId],
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
