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
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
            'start_time' => ['required_if:type,ot', 'required_with:end_time', 'nullable', 'date_format:H:i'],
            'end_time' => ['required_if:type,ot', 'required_with:start_time', 'nullable', 'date_format:H:i', 'after:start_time'],
            'hours' => ['required_if:type,ot', 'nullable', 'numeric', 'min:0.5', 'max:24'],
        ];
    }

    public function attributes(): array
    {
        return [
            'start_time' => 'giờ bắt đầu',
            'end_time' => 'giờ kết thúc',
            'hours' => 'số giờ',
            'reason' => 'lý do',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute là bắt buộc.',
            'required_if' => ':attribute là bắt buộc khi loại đơn là OT.',
            'type.enum' => 'Loại đơn không hợp lệ.',
            'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
            'end_time.after' => 'Giờ kết thúc phải sau giờ bắt đầu.',
            'required_with' => ':attribute là bắt buộc khi đã chọn giờ kia.',
            'date_format' => ':attribute không đúng định dạng.',
            'reason.max' => 'Lý do không được vượt quá :max ký tự.',
            'reason.min' => 'Lý do phải có ít nhất :min ký tự.',
            'hours.min' => 'Số giờ OT tối thiểu là :min.',
            'hours.max' => 'Số giờ OT tối đa là :max.',
        ];
    }
}
