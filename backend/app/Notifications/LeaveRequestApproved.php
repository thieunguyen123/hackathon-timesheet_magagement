<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveRequestApproved extends Notification
{
    use Queueable;

    public function __construct(private LeaveRequest $request) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $approver = $this->request->approver?->name ?? __('notifications.leave_request.approver_fallback');

        return [
            'title' => __('notifications.leave_request.approved_title'),
            'message' => __('notifications.leave_request.approved', [
                'type' => $this->request->type->shortLabel(),
                'approver' => $approver,
            ]),
            'link' => '/requests',
            'request_id' => $this->request->id,
        ];
    }
}
