<?php

namespace App\Http\Controllers;

use App\Exports\ArrayExport;
use App\Http\Requests\ExportRequestsRequest;
use App\Http\Requests\ExportTimesheetRequest;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Support\DateHelper;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportController extends Controller
{
    /**
     * GET /api/admin/export/timesheet?month=YYYY-MM
     * Xuất bảng công (chấm công) của toàn bộ nhân viên theo tháng.
     */
    public function timesheet(ExportTimesheetRequest $request): BinaryFileResponse
    {
        $month = $request->validated('month');
        [$start] = DateHelper::monthRange(is_string($month) ? $month : null);
        $year = $start->year;
        $mon = $start->month;
        $month = $start->format('Y-m');

        $rows = Attendance::with('user:id,name,email')
            ->whereYear('date', $year)
            ->whereMonth('date', $mon)
            ->orderBy('user_id')
            ->orderBy('date')
            ->get()
            ->map(fn (Attendance $a) => [
                $a->user?->name,
                $a->user?->email,
                $a->date?->format('d/m/Y'),
                $a->check_in?->format('H:i'),
                $a->check_out?->format('H:i'),
                $a->work_hours,
                $a->source,
            ])
            ->all();

        $export = new ArrayExport($rows, ['Nhân viên', 'Email', 'Ngày', 'Check-in', 'Check-out', 'Số giờ', 'Nguồn']);

        return Excel::download($export, "bang-cong-{$month}.xlsx");
    }

    /**
     * GET /api/admin/export/requests?month=YYYY-MM&status=pending
     * Xuất danh sách đơn từ (off/remote/ot), lọc theo tháng của start_date và status.
     */
    public function requests(ExportRequestsRequest $request): BinaryFileResponse
    {
        $validated = $request->validated();

        $query = LeaveRequest::with(['user', 'approver'])->orderBy('start_date');

        $month = $validated['month'] ?? null;
        if (is_string($month) && preg_match('/^\d{4}-\d{2}$/', $month)) {
            [$year, $mon] = explode('-', $month);
            $query->whereYear('start_date', $year)
                ->whereMonth('start_date', $mon);
        }

        if ($status = $validated['status'] ?? null) {
            $query->where('status', $status);
        }

        $rows = $query->get()
            ->map(fn (LeaveRequest $r) => [
                $r->user?->name,
                $r->type?->label(),
                $r->start_date?->format('d/m/Y'),
                $r->end_date?->format('d/m/Y'),
                $r->hours,
                $r->reason,
                $r->status?->label(),
                $r->approver?->name,
            ])
            ->all();

        $export = new ArrayExport($rows, ['Nhân viên', 'Loại đơn', 'Từ ngày', 'Đến ngày', 'Số giờ OT', 'Lý do', 'Trạng thái', 'Người duyệt']);

        return Excel::download($export, 'don-tu.xlsx');
    }
}
