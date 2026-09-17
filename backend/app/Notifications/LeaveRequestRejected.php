<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveRequestRejected extends Notification
{
    use Queueable;

    public function __construct(private LeaveRequest $request) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $message = __('notifications.leave_request.rejected', [
            'type' => $this->request->type->shortLabel(),
        ]);

        if (! empty($this->request->reject_reason)) {
            $message .= __('notifications.leave_request.rejected_reason', [
                'reason' => $this->request->reject_reason,
            ]);
        }

        return [
            'title' => __('notifications.leave_request.rejected_title'),
            'message' => $message,
            'link' => '/requests',
            'request_id' => $this->request->id,
        ];
    }
}
