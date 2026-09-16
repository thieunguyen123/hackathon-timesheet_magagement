<?php

namespace App\Http\Requests;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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
            'required' => ':attribute là bắt buộc.',
            'email.email' => 'Email không hợp lệ.',
            'email.unique' => 'Email đã tồn tại.',
            'password.min' => 'Mật khẩu phải có ít nhất :min ký tự.',
            'role.enum' => 'Vai trò không hợp lệ.',
            'gender.in' => 'Giới tính không hợp lệ.',
            'start_date.date' => 'Ngày bắt đầu làm việc không hợp lệ.',
            'manager_id.exists' => 'Quản lý không tồn tại.',
            'annual_leave_days.max' => 'Số ngày phép tối đa là :max.',
        ];
    }
}
