<?php

return [
    // Generic rule messages (top-level)
    'required' => ':attribute là bắt buộc.',
    'string' => ':attribute phải là chuỗi ký tự.',
    'integer' => ':attribute phải là số nguyên.',
    'numeric' => ':attribute phải là số.',
    'boolean' => ':attribute phải là true hoặc false.',
    'date' => ':attribute không phải là ngày hợp lệ.',
    'date_format' => ':attribute không đúng định dạng.',
    'email' => ':attribute không hợp lệ.',
    'exists' => ':attribute không tồn tại.',
    'unique' => ':attribute đã tồn tại.',
    'in' => ':attribute không hợp lệ.',
    'not_in' => ':attribute không hợp lệ.',
    'enum' => ':attribute không hợp lệ.',
    'after' => ':attribute phải là ngày sau :date.',
    'after_or_equal' => ':attribute phải là ngày sau hoặc bằng :date.',
    'min' => [
        'numeric' => ':attribute phải tối thiểu là :min.',
        'string' => ':attribute phải có ít nhất :min ký tự.',
    ],
    'max' => [
        'numeric' => ':attribute không được vượt quá :max.',
        'string' => ':attribute không được vượt quá :max ký tự.',
    ],

    // Attribute-specific messages (custom)
    'custom' => [
        'month' => ['date_format' => 'Tháng phải có định dạng Y-m.'],
        'year' => [
            'min' => 'Năm phải từ :min trở lên.',
            'max' => 'Năm không được vượt quá :max.',
        ],
        'user_id' => ['exists' => 'Nhân viên không tồn tại.'],
        'manager_id' => [
            'exists' => 'Quản lý không tồn tại.',
            'not_in' => 'Không thể chọn chính mình làm quản lý.',
        ],
        'email' => [
            'email' => 'Email không hợp lệ.',
            'unique' => 'Email đã tồn tại.',
        ],
        'password' => ['min' => 'Mật khẩu phải có ít nhất :min ký tự.'],
        'role' => ['enum' => 'Vai trò không hợp lệ.'],
        'gender' => ['in' => 'Giới tính không hợp lệ.'],
        'type' => ['enum' => 'Loại đơn không hợp lệ.'],
        'status' => ['enum' => 'Trạng thái không hợp lệ.'],
        'annual_leave_days' => ['max' => 'Số ngày phép tối đa là :max.'],
        'reject_reason' => [
            'required' => 'Vui lòng nhập lý do từ chối.',
            'max' => 'Lý do từ chối không được vượt quá :max ký tự.',
        ],
        'reason' => [
            'min' => 'Lý do phải có ít nhất :min ký tự.',
            'max' => 'Lý do không được vượt quá :max ký tự.',
        ],
        'hours' => [
            'min' => 'Số giờ OT tối thiểu là :min.',
            'max' => 'Số giờ OT tối đa là :max.',
        ],
        'end_date' => ['after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'],
        'end_time' => ['after' => 'Giờ kết thúc phải sau giờ bắt đầu.'],
    ],

    // Attribute display names
    'attributes' => [
        'name' => 'tên',
        'email' => 'email',
        'password' => 'mật khẩu',
        'role' => 'vai trò',
        'gender' => 'giới tính',
        'start_date' => 'ngày bắt đầu',
        'end_date' => 'ngày kết thúc',
        'start_time' => 'giờ bắt đầu',
        'end_time' => 'giờ kết thúc',
        'hours' => 'số giờ',
        'reason' => 'lý do',
        'reject_reason' => 'lý do từ chối',
        'status' => 'trạng thái',
        'type' => 'loại đơn',
        'user_id' => 'nhân viên',
        'manager_id' => 'quản lý',
        'year' => 'năm',
        'month' => 'tháng',
        'annual_leave_days' => 'số ngày phép',
    ],
];
