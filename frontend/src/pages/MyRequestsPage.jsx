import { useCallback, useEffect, useState } from 'react';
import { leaveBalanceApi, requestApi } from '../api';
import {
  Avatar,
  EmptyState,
  Loading,
  Modal,
  StatusBadge,
  Tabs,
  TypeChip,
} from '../components/ui';
import { REQUEST_STATUSES, REQUEST_TYPES } from '../constants';
import { useToast } from '../context/ToastContext';
import { useModal } from '../hooks/useModal';
import { extractError, fmtDate, fmtTime, normalizeList } from '../utils/format';

const initialForm = {
  type: 'off',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  hours: '',
  reason: '',
};

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

// useModal() may return { open, openModal, closeModal }, { isOpen, open, close }
// or a tuple — normalize to a single shape.
const useModalControls = () => {
  const m = useModal() ?? {};
  if (Array.isArray(m)) {
    const [open, a, b] = m;
    return {
      open: Boolean(open),
      openModal:
        typeof a === 'function'
          ? () => a(true)
          : a?.openModal ?? a?.open ?? (() => {}),
      closeModal:
        typeof a === 'function'
          ? () => a(false)
          : a?.closeModal ?? a?.close ?? b ?? (() => {}),
    };
  }
  return {
    open: typeof m.open === 'boolean' ? m.open : Boolean(m.isOpen),
    openModal:
      m.openModal ??
      m.show ??
      (typeof m.open === 'function' ? m.open : undefined) ??
      (() => {}),
    closeModal: m.closeModal ?? m.hide ?? m.close ?? (() => {}),
  };
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...toOptions(REQUEST_STATUSES),
];
const TYPE_OPTIONS = toOptions(REQUEST_TYPES);

const cardCls =
  'mb-5 rounded-xl border border-[#e6e9f2] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]';
const statValueCls =
  'text-[30px] font-extrabold leading-[1.2] tracking-[-0.02em]';
const statLabelCls = 'mt-1 text-[13px] font-medium text-[#7a8499]';
const labelCls = 'mb-1.5 block text-[13px] font-semibold text-[#1a2233]';
const inputCls =
  'w-full rounded-[10px] border border-[#e6e9f2] bg-white px-3 py-[9px] text-sm text-[#1a2233] transition focus:border-primary-500 focus:outline-none focus:ring focus:ring-primary-500/[0.12]';
const btnBaseCls =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border px-4 py-[9px] text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const btnPrimaryCls = `${btnBaseCls} border-transparent bg-primary-500 text-white shadow-[0_2px_6px_rgba(47,107,255,0.25)] enabled:hover:bg-[#2058e0]`;
const btnSecondaryCls = `${btnBaseCls} border-[#e6e9f2] bg-white text-[#1a2233] enabled:hover:border-[#d5dbe8] enabled:hover:bg-[#f6f8fc]`;
const fabCls =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary-500 px-[22px] py-3 text-sm font-bold text-white shadow-[0_6px_16px_rgba(47,107,255,0.35)] transition enabled:hover:-translate-y-px enabled:hover:bg-[#2058e0] enabled:hover:shadow-[0_8px_20px_rgba(47,107,255,0.4)] disabled:cursor-not-allowed disabled:opacity-60';
const reqMetaCls = 'text-[13px] text-[#7a8499]';

export default function MyRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(null);

  const modal = useModalControls();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const res = await leaveBalanceApi.get();
      setBalance(res?.data?.data ?? res?.data ?? res ?? null);
    } catch {
      // leave balance is optional — ignore errors
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestApi.list({
        all: 1,
        status: status || undefined,
      });
      setRequests(listOf(res));
    } catch (err) {
      toast.error(extractError(err));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [status, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const openModal = () => {
    setForm(initialForm);
    modal.openModal();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
      };
      if (form.type === 'ot') {
        payload.start_time = form.start_time;
        payload.end_time = form.end_time;
        payload.hours = Number(form.hours);
      }
      const res = await requestApi.create(payload);
      modal.closeModal();
      setForm(initialForm);
      toast.success(res?.data?.message ?? res?.message ?? 'Đã gửi đơn thành công');
      loadRequests();
      loadBalance();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-[-0.02em]">Đơn của tôi</h2>
        <button type="button" className={fabCls} onClick={openModal}>
          ＋ Tạo đơn
        </button>
      </div>

      {/* Leave balance strip */}
      <div className={cardCls}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className={statLabelCls}>Phép năm</div>
            <div className={statValueCls}>{balance?.total_days ?? '—'}</div>
          </div>
          <div>
            <div className={statLabelCls}>Đã dùng</div>
            <div className={statValueCls}>{balance?.used_days ?? '—'}</div>
          </div>
          <div>
            <div className={statLabelCls}>Còn lại</div>
            <div className={`${statValueCls} text-primary-500`}>
              {balance?.remaining ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <EmptyState text="Chưa có đơn nào" />
      ) : (
        <div className="grid gap-3">
          {requests.map((r) => (
            <div
              className="flex flex-col gap-2 rounded-xl border border-[#e6e9f2] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:shadow-[0_6px_16px_rgba(16,24,40,0.08)]"
              key={r.id}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar name={r.user?.name} sm />
                  <div>
                    <div>{r.user?.name || '—'}</div>
                    <div className={reqMetaCls}>{fmtDate(r.created_at)}</div>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <TypeChip type={r.type} />
                  <StatusBadge status={r.status} />
                </div>
              </div>

              <div className="font-semibold">
                {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
              </div>
              {r.type === 'ot' && (
                <div className={reqMetaCls}>
                  {fmtTime(r.start_time)}–{fmtTime(r.end_time)}
                  {r.hours != null && ` · ${r.hours}h`}
                </div>
              )}
              {r.reason && <div>{r.reason}</div>}

              {r.approver?.name && (
                <div className={reqMetaCls}>Người duyệt: {r.approver.name}</div>
              )}
              {r.status === 'rejected' && r.reject_reason && (
                <div className="text-[13px] text-[#ef4b4b]">
                  Lý do từ chối: {r.reject_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create request modal */}
      <Modal open={modal.open} onClose={modal.closeModal} title="Tạo đơn mới">
        <form onSubmit={onSubmit}>
          <div className="mb-3.5">
            <label className={labelCls}>Loại đơn</label>
            <select
              className={inputCls}
              name="type"
              value={form.type}
              onChange={onChange}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3.5">
            <label className={labelCls}>Từ ngày</label>
            <input
              type="date"
              className={inputCls}
              name="start_date"
              value={form.start_date}
              onChange={onChange}
              required
            />
          </div>
          <div className="mb-3.5">
            <label className={labelCls}>Đến ngày</label>
            <input
              type="date"
              className={inputCls}
              name="end_date"
              value={form.end_date}
              onChange={onChange}
              required
            />
          </div>
          {form.type === 'ot' && (
            <>
              <div className="mb-3.5">
                <label className={labelCls}>Giờ bắt đầu</label>
                <input
                  type="time"
                  className={inputCls}
                  name="start_time"
                  value={form.start_time}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3.5">
                <label className={labelCls}>Giờ kết thúc</label>
                <input
                  type="time"
                  className={inputCls}
                  name="end_time"
                  value={form.end_time}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mb-3.5">
                <label className={labelCls}>Số giờ</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className={inputCls}
                  name="hours"
                  value={form.hours}
                  onChange={onChange}
                  required
                />
              </div>
            </>
          )}
          <div className="mb-3.5">
            <label className={labelCls}>Lý do</label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              name="reason"
              value={form.reason}
              onChange={onChange}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className={btnSecondaryCls}
              onClick={modal.closeModal}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={btnPrimaryCls}
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đơn'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
