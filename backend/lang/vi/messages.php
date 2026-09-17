<?php

return [
    'auth' => [
        'login_failed' => 'Email hoặc mật khẩu không đúng',
        'logout_success' => 'Đăng xuất thành công',
        'unauthenticated' => 'Bạn chưa đăng nhập',
    ],
    'common' => [
        'forbidden' => 'Bạn không có quyền truy cập',
        'not_found' => 'Không tìm thấy dữ liệu',
        'server_error' => 'Đã có lỗi xảy ra, vui lòng thử lại sau',
        'ok' => 'OK',
    ],
    'attendance' => [
        'sync_success' => 'Đồng bộ chấm công thành công',
        'forbidden_view' => 'Bạn không có quyền xem nhân viên này',
    ],
    'leave_request' => [
        'created' => 'Tạo đơn thành công',
        'approved' => 'Đã duyệt đơn',
        'rejected' => 'Đã từ chối đơn',
        'forbidden_view' => 'Không có quyền xem đơn của nhân viên này',
        'forbidden_self_action' => 'Không thể tự duyệt đơn của mình',
        'forbidden_action' => 'Không có quyền duyệt đơn này',
        'already_processed' => 'Đơn đã được xử lý',
    ],
    'leave_balance' => [
        'forbidden_view' => 'Không có quyền xem số dư phép của nhân viên này',
    ],
    'user' => [
        'created' => 'Tạo nhân viên thành công',
        'updated' => 'Cập nhật thành công',
        'deleted' => 'Đã xóa nhân viên',
        'forbidden_self_role' => 'Không thể đổi quyền của chính mình',
        'forbidden_self_delete' => 'Không thể xóa chính mình',
    ],
    'integration' => [
        'connecteam_error' => 'Lỗi kết nối Connecteam (HTTP :status)',
    ],
];
