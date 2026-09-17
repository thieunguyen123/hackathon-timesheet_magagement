<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmitted extends Notification
{
    use Queueable;

    public function __construct(private LeaveRequest $request) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $dateRange = $this->request->start_date->format('d/m/Y')
            .' - '.$this->request->end_date->format('d/m/Y');

        return [
            'title' => __('notifications.leave_request.submitted_title'),
            'message' => __('notifications.leave_request.submitted', [
                'name' => $this->request->user->name,
                'type' => $this->request->type->shortLabel(),
                'range' => $dateRange,
            ]),
            'link' => '/approvals',
            'request_id' => $this->request->id,
        ];
    }
}
