<?php

namespace App\Notifications;

use App\Enums\RequestType;
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
        $approver = $this->request->approver?->name ?? 'quản lý';

        return [
            'title' => 'Đơn đã được duyệt',
            'message' => "Đơn {$this->typeLabel()} của bạn đã được {$approver} duyệt",
            'link' => '/requests',
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
