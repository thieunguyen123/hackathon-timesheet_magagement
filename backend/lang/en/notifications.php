<?php

return [
    'leave_request' => [
        'submitted_title' => 'New request needs approval',
        'submitted' => ':name submitted a :type request (:range)',
        'approved_title' => 'Request approved',
        'approved' => 'Your :type request was approved by :approver',
        'rejected_title' => 'Request rejected',
        'rejected' => 'Your :type request was rejected',
        'rejected_reason' => '. Reason: :reason',
        'approver_fallback' => 'your manager',
    ],
    'slack' => [
        'new_request' => ':memo: *New request needs approval*',
        'employee' => '• Employee: :name',
        'type' => '• Type: :type',
        'period' => '• Period: :from → :to',
        'ot_hours' => '• OT hours: :hours',
        'reason' => '• Reason: :reason',
    ],
];
