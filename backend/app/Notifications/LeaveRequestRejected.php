<?php

namespace App\Notifications;

use App\Enums\RequestType;
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
        $message = "Đơn {$this->typeLabel()} của bạn đã bị từ chối";

        if (! empty($this->request->reject_reason)) {
            $message .= ". Lý do: {$this->request->reject_reason}";
        }

        return [
            'title' => 'Đơn bị từ chối',
            'message' => $message,
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
