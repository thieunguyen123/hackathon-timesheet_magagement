<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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
            'required' => ':attribute là bắt buộc.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã tồn tại.',
            'password.min' => 'Mật khẩu phải có ít nhất :min ký tự.',
            'role.enum' => 'Vai trò không hợp lệ.',
            'gender.in' => 'Giới tính không hợp lệ.',
            'start_date.date' => 'Ngày bắt đầu làm việc không hợp lệ.',
            'manager_id.exists' => 'Quản lý không tồn tại.',
            'manager_id.not_in' => 'Không thể chọn chính mình làm quản lý.',
            'annual_leave_days.max' => 'Số ngày phép tối đa là :max.',
        ];
    }
}
