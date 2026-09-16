<?php

namespace App\Notifications;

use App\Enums\RequestType;
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
            'title' => 'Đơn mới cần duyệt',
            'message' => "{$this->request->user->name} đã gửi đơn {$this->typeLabel()} ({$dateRange})",
            'link' => '/approvals',
            'request_id' => $this->request->id,
        ];
    }

    private function typeLabel(): string
    {
        return match ($this->request->type) {
            RequestType::Off => 'nghỉ phép',
            RequestType::Remote => 'remote',
            RequestType::Ot => 'OT',
        };
    }
}
