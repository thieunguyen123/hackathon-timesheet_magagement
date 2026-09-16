import { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import { EmptyState, Loading } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { extractError } from '../utils/format';

const statCardCls =
  'rounded-xl border border-[#e6e9f2] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]';
const statValueCls =
  'text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em]';
const statLabelCls = 'mt-1 text-[13px] font-medium text-[#7a8499]';
const badgeCls =
  'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold';

// Cards render only when the API returns the key (role-dependent stats).
const STAT_CARDS = [
  { key: 'month_hours', label: 'Giờ làm tháng này', format: (v) => `${v ?? 0}h` },
  { key: 'month_days', label: 'Ngày công tháng này' },
  { key: 'pending_requests', label: 'Đơn chờ duyệt' },
  { key: 'leave_remaining', label: 'Phép còn lại', format: (v) => `${v ?? 0} ngày` },
  { key: 'team_size', label: 'Nhân viên trong team' },
  { key: 'team_pending', label: 'Đơn team chờ duyệt' },
  { key: 'total_users', label: 'Tổng nhân viên' },
  { key: 'today_present', label: 'Đi làm hôm nay' },
  { key: 'pending_total', label: 'Tổng đơn chờ' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await dashboardApi.stats();
        if (!cancelled) setStats(res.data);
      } catch (err) {
        if (!cancelled) {
          setFailed(true);
          toast.error(extractError(err, 'Không thể tải dữ liệu tổng quan'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderCard = (value, label) => (
    <div className={statCardCls} key={label}>
      <div className={statValueCls}>{value ?? '—'}</div>
      <div className={statLabelCls}>{label}</div>
    </div>
  );

  return (
    <div className="max-w-[1200px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-[-0.02em]">Tổng quan</h2>
      </div>

      {loading ? (
        <Loading />
      ) : stats ? (
        <>
          <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {STAT_CARDS.filter((c) => stats[c.key] !== undefined).map((c) =>
              renderCard(
                c.format ? c.format(stats[c.key]) : stats[c.key],
                c.label
              )
            )}
          </div>

          {stats.requests_by_status && (
            <div className={`${statCardCls} mb-5`}>
              <h3>Đơn theo trạng thái</h3>
              <div className="flex flex-wrap gap-3">
                <span className={`${badgeCls} bg-[#fff4e0] text-[#b7791f]`}>
                  Chờ duyệt: {stats.requests_by_status.pending ?? 0}
                </span>
                <span className={`${badgeCls} bg-[#e0f6ec] text-[#1f7a4d]`}>
                  Đã duyệt: {stats.requests_by_status.approved ?? 0}
                </span>
                <span className={`${badgeCls} bg-[#fdeaea] text-[#cf3a3a]`}>
                  Từ chối: {stats.requests_by_status.rejected ?? 0}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        !failed && <EmptyState message="Không có dữ liệu">Không có dữ liệu</EmptyState>
      )}
    </div>
  );
}
