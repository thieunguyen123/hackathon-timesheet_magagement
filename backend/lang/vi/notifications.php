<?php

return [
    'leave_request' => [
        'submitted_title' => 'Đơn mới cần duyệt',
        'submitted' => ':name đã gửi đơn :type (:range)',
        'approved_title' => 'Đơn đã được duyệt',
        'approved' => 'Đơn :type của bạn đã được :approver duyệt',
        'rejected_title' => 'Đơn bị từ chối',
        'rejected' => 'Đơn :type của bạn đã bị từ chối',
        'rejected_reason' => '. Lý do: :reason',
        'approver_fallback' => 'quản lý',
    ],
    'slack' => [
        'new_request' => ':memo: *Đơn mới cần duyệt*',
        'employee' => '• Nhân viên: :name',
        'type' => '• Loại: :type',
        'period' => '• Thời gian: :from → :to',
        'ot_hours' => '• Số giờ OT: :hours',
        'reason' => '• Lý do: :reason',
    ],
];
