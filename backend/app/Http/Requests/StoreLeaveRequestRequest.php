<?php

namespace App\Http\Requests;

use App\Enums\RequestType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(RequestType::class)],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'start_time' => ['required_if:type,ot', 'nullable', 'date_format:H:i'],
            'end_time' => ['required_if:type,ot', 'nullable', 'date_format:H:i'],
            'hours' => ['required_if:type,ot', 'nullable', 'numeric', 'min:0.5', 'max:24'],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute là bắt buộc.',
            'required_if' => ':attribute là bắt buộc khi loại đơn là OT.',
            'type.enum' => 'Loại đơn không hợp lệ.',
            'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
            'date_format' => ':attribute không đúng định dạng.',
            'reason.max' => 'Lý do không được vượt quá :max ký tự.',
            'hours.min' => 'Số giờ OT tối thiểu là :min.',
            'hours.max' => 'Số giờ OT tối đa là :max.',
        ];
    }
}
