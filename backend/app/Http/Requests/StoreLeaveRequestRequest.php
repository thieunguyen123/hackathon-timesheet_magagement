<?php

namespace App\Http\Requests;

use App\Enums\RequestType;
use Illuminate\Validation\Rule;

class StoreLeaveRequestRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(RequestType::class)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
            'start_time' => ['required_if:type,ot', 'required_with:end_time', 'nullable', 'date_format:H:i'],
            'end_time' => ['required_if:type,ot', 'required_with:start_time', 'nullable', 'date_format:H:i', 'after:start_time'],
            'hours' => ['required_if:type,ot', 'nullable', 'numeric', 'min:0.5', 'max:24'],
        ];
    }

    public function messages(): array
    {
        return [
            'required_if' => ':attribute là bắt buộc khi loại đơn là OT.',
            'required_with' => ':attribute là bắt buộc khi đã chọn giờ kia.',
        ];
    }
}
