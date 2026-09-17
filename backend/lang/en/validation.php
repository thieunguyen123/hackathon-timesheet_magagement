<?php

return [
    // Generic rule messages (top-level)
    'required' => 'The :attribute field is required.',
    'string' => 'The :attribute field must be a string.',
    'integer' => 'The :attribute field must be an integer.',
    'numeric' => 'The :attribute field must be a number.',
    'boolean' => 'The :attribute field must be true or false.',
    'date' => 'The :attribute field must be a valid date.',
    'date_format' => 'The :attribute field must match the format :format.',
    'email' => 'The :attribute field must be a valid email address.',
    'exists' => 'The selected :attribute is invalid.',
    'unique' => 'The :attribute has already been taken.',
    'in' => 'The selected :attribute is invalid.',
    'not_in' => 'The selected :attribute is invalid.',
    'enum' => 'The selected :attribute is invalid.',
    'after' => 'The :attribute field must be a date after :date.',
    'after_or_equal' => 'The :attribute field must be a date after or equal to :date.',
    'min' => [
        'numeric' => 'The :attribute field must be at least :min.',
        'string' => 'The :attribute field must be at least :min characters.',
    ],
    'max' => [
        'numeric' => 'The :attribute field must not be greater than :max.',
        'string' => 'The :attribute field must not be greater than :max characters.',
    ],

    // Attribute-specific messages (custom)
    'custom' => [
        'month' => ['date_format' => 'The month must be in the format Y-m.'],
        'year' => [
            'min' => 'The year must be at least :min.',
            'max' => 'The year must not be greater than :max.',
        ],
        'user_id' => ['exists' => 'The selected employee does not exist.'],
        'manager_id' => [
            'exists' => 'The selected manager does not exist.',
            'not_in' => 'You cannot select yourself as a manager.',
        ],
        'email' => [
            'email' => 'The email address is invalid.',
            'unique' => 'The email has already been taken.',
        ],
        'password' => ['min' => 'The password must be at least :min characters.'],
        'role' => ['enum' => 'The selected role is invalid.'],
        'gender' => ['in' => 'The selected gender is invalid.'],
        'type' => ['enum' => 'The selected request type is invalid.'],
        'status' => ['enum' => 'The selected status is invalid.'],
        'annual_leave_days' => ['max' => 'The annual leave days must not be greater than :max.'],
        'reject_reason' => [
            'required' => 'Please enter a rejection reason.',
            'max' => 'The rejection reason must not be greater than :max characters.',
        ],
        'reason' => [
            'min' => 'The reason must be at least :min characters.',
            'max' => 'The reason must not be greater than :max characters.',
        ],
        'hours' => [
            'min' => 'The minimum OT hours is :min.',
            'max' => 'The maximum OT hours is :max.',
        ],
        'end_date' => ['after_or_equal' => 'The end date must be after or equal to the start date.'],
        'end_time' => ['after' => 'The end time must be after the start time.'],
    ],

    // Attribute display names
    'attributes' => [
        'name' => 'name',
        'email' => 'email',
        'password' => 'password',
        'role' => 'role',
        'gender' => 'gender',
        'start_date' => 'start date',
        'end_date' => 'end date',
        'start_time' => 'start time',
        'end_time' => 'end time',
        'hours' => 'hours',
        'reason' => 'reason',
        'reject_reason' => 'rejection reason',
        'status' => 'status',
        'type' => 'request type',
        'user_id' => 'employee',
        'manager_id' => 'manager',
        'year' => 'year',
        'month' => 'month',
        'annual_leave_days' => 'annual leave days',
    ],
];
