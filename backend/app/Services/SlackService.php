<?php

namespace App\Services;

use App\Enums\RequestType;
use App\Models\LeaveRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SlackService
{
    /**
     * Send a Slack notification for a newly created leave request.
     *
     * Silently skips when the webhook URL is not configured and never throws —
     * notification failures must not break request creation.
     */
    public function notifyNewRequest(LeaveRequest $leaveRequest): void
    {
        $url = config('services.slack.webhook_url');

        if (empty($url)) {
            Log::info('Slack webhook not configured, skipped notification');

            return;
        }

        $text = ":memo: *Đơn mới cần duyệt*\n"
            ."• Nhân viên: {$leaveRequest->user->name}\n"
            ."• Loại: {$leaveRequest->type->label()}\n"
            ."• Thời gian: {$leaveRequest->start_date->format('d/m/Y')} → {$leaveRequest->end_date->format('d/m/Y')}";

        if ($leaveRequest->type === RequestType::Ot) {
            $text .= "\n• Số giờ OT: {$leaveRequest->hours}";
        }

        if (! empty($leaveRequest->reason)) {
            $text .= "\n• Lý do: {$leaveRequest->reason}";
        }

        try {
            Http::timeout(5)->post($url, ['text' => $text]);
        } catch (Throwable $e) {
            Log::warning('Slack notification failed: '.$e->getMessage());
        }
    }
}
