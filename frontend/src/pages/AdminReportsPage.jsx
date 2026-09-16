import { useEffect, useState } from 'react';
import { exportApi, requestApi } from '../api';
import { EmptyState, Loading, StatusBadge, TypeChip } from '../components/ui';
import { REQUEST_STATUSES } from '../constants';
import { useToast } from '../context/ToastContext';
import { extractError, fmtDate, normalizeList } from '../utils/format';

// Tailwind class strings mirroring the legacy styles.css rules.
const pageHeaderCls =
  'mb-5 flex flex-wrap items-center justify-between gap-3';
const pageTitleCls = 'text-[22px] font-bold tracking-[-0.02em]';
const cardCls =
  'mb-5 rounded-xl border border-[#e6e9f2] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]';
const filtersCls = 'mb-4 flex flex-wrap items-end gap-3';
const formInputCls =
  'w-full rounded-[10px] border border-[#e6e9f2] bg-white px-3 py-[9px] text-sm text-[#1a2233] transition focus:border-primary-500 focus:outline-none focus:shadow-[0_0_0_3px_rgba(47,107,255,0.12)]';
const btnCls =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-transparent px-4 py-[9px] text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const btnPrimaryCls = `${btnCls} bg-primary-500 text-white shadow-[0_2px_6px_rgba(47,107,255,0.25)] enabled:hover:bg-[#2058e0]`;
const btnSecondaryCls = `${btnCls} border-[#e6e9f2] bg-white text-[#1a2233] enabled:hover:border-[#d5dbe8] enabled:hover:bg-[#f6f8fc]`;
const statGridCls =
  'mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4';
const statCardCls =
  'rounded-xl border border-[#e6e9f2] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]';
const statValueCls =
  'text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em]';
const statLabelCls = 'mt-1 text-[13px] font-medium text-[#7a8499]';
const tableCls = 'w-full border-collapse text-sm';
const thCls =
  'border-b border-[#e6e9f2] bg-[#fafbfe] px-[14px] py-[11px] text-left align-middle text-[11px] font-bold uppercase tracking-[0.05em] text-[#7a8499]';
const tdCls =
  'border-b border-[#e6e9f2] px-[14px] py-[11px] text-left align-middle';
const trCls =
  'transition-colors duration-[120ms] hover:bg-[#f8fafd] last:[&>td]:border-b-0';

// Constants may be { key: { label } } maps or arrays of { value, label }.
const toOptions = (c) =>
  Array.isArray(c)
    ? c
    : Object.entries(c || {}).map(([value, v]) => ({
        value,
        label: v?.label ?? v,
      }));

// normalizeList may accept the axios response or res.data — handle either.
const listOf = (res) => {
  const v = normalizeList(res);
  if (Array.isArray(v)) return v;
  const w = normalizeList(res?.data);
  return Array.isArray(w) ? w : [];
};

const downloadBlob = (data, filename) => {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
};

const STATUS_OPTIONS = toOptions(REQUEST_STATUSES);

export default function AdminReportsPage() {
  const toast = useToast();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await requestApi.list({ all: 1 });
        if (!cancelled) setRequests(listOf(res));
      } catch (err) {
        if (cancelled) return;
        toast.error(extractError(err, 'Không thể tải dữ liệu báo cáo'));
        setRequests([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthRequests = requests.filter((r) =>
    (r.start_date || '').startsWith(month),
  );

  const countOf = (s) => monthRequests.filter((r) => r.status === s).length;

  const doExport = async (kind) => {
    setDownloading(kind);
    try {
      const res =
        kind === 'timesheet'
          ? await exportApi.timesheet(month)
          : await exportApi.requests(month);
      const filename =
        kind === 'timesheet'
          ? `bang-cong-${month}.xlsx`
          : `don-tu-${month}.xlsx`;
      downloadBlob(res?.data ?? res, filename);
    } catch (err) {
      toast.error(extractError(err, 'Xuất file thất bại'));
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="max-w-[1200px]">
      <div className={pageHeaderCls}>
        <h2 className={pageTitleCls}>Báo cáo &amp; Xuất file</h2>
      </div>

      <div className={cardCls}>
        <h3>Xuất Excel</h3>
        <div className={filtersCls}>
          <input
            type="month"
            className={formInputCls}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <button
            className={btnPrimaryCls}
            disabled={!month || downloading !== ''}
            onClick={() => doExport('timesheet')}
          >
            {downloading === 'timesheet' ? 'Đang xuất...' : 'Xuất bảng công'}
          </button>
          <button
            className={btnSecondaryCls}
            disabled={downloading !== ''}
            onClick={() => doExport('requests')}
          >
            {downloading === 'requests' ? 'Đang xuất...' : 'Xuất danh sách đơn'}
          </button>
        </div>
      </div>

      <div className={cardCls}>
        <h3>Đơn theo trạng thái (tháng đã chọn)</h3>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className={statGridCls}>
              {STATUS_OPTIONS.map((s) => (
                <div className={statCardCls} key={s.value}>
                  <div className={statValueCls}>{countOf(s.value)}</div>
                  <div className={statLabelCls}>{s.label}</div>
                </div>
              ))}
              <div className={statCardCls}>
                <div className={statValueCls}>{monthRequests.length}</div>
                <div className={statLabelCls}>Tổng đơn</div>
              </div>
            </div>

            {monthRequests.length === 0 ? (
              <EmptyState text="Không có đơn nào trong tháng" />
            ) : (
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Nhân viên</th>
                    <th className={thCls}>Loại</th>
                    <th className={thCls}>Ngày</th>
                    <th className={thCls}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {monthRequests.map((r) => (
                    <tr className={trCls} key={r.id}>
                      <td className={tdCls}>{r.user?.name || '—'}</td>
                      <td className={tdCls}>
                        <TypeChip type={r.type} />
                      </td>
                      <td className={tdCls}>
                        {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
                      </td>
                      <td className={tdCls}>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}
