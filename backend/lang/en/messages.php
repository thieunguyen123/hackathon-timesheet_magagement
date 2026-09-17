<?php

return [
    'auth' => [
        'login_failed' => 'Incorrect email or password',
        'logout_success' => 'Logged out successfully',
        'unauthenticated' => 'You are not logged in',
    ],
    'common' => [
        'forbidden' => 'You do not have permission to access this resource',
        'not_found' => 'Resource not found',
        'server_error' => 'Something went wrong, please try again later',
        'ok' => 'OK',
    ],
    'attendance' => [
        'sync_success' => 'Attendance synced successfully',
        'forbidden_view' => 'You cannot view this employee',
    ],
    'leave_request' => [
        'created' => 'Leave request created successfully',
        'approved' => 'Request approved',
        'rejected' => 'Request rejected',
        'forbidden_view' => 'You cannot view this employee\'s requests',
        'forbidden_self_action' => 'You cannot approve your own request',
        'forbidden_action' => 'You do not have permission to process this request',
        'already_processed' => 'This request has already been processed',
    ],
    'leave_balance' => [
        'forbidden_view' => 'You cannot view this employee\'s leave balance',
    ],
    'user' => [
        'created' => 'Employee created successfully',
        'updated' => 'Updated successfully',
        'deleted' => 'Employee deleted',
        'forbidden_self_role' => 'You cannot change your own role',
        'forbidden_self_delete' => 'You cannot delete yourself',
    ],
    'integration' => [
        'connecteam_error' => 'Connecteam connection error (HTTP :status)',
    ],
];
