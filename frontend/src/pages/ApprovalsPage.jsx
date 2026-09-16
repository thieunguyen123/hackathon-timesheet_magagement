import { useCallback, useEffect, useState } from 'react';
import { requestApi } from '../api';
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
import { extractError, fmtDate, fmtTime, normalizeList } from '../utils/format';

// Tailwind class strings mirroring the legacy styles.css rules.
const pageHeaderCls =
  'mb-5 flex flex-wrap items-center justify-between gap-3';
const pageTitleCls = 'text-[22px] font-bold tracking-[-0.02em]';
const filtersCls = 'mb-4 flex flex-wrap items-end gap-3';
const formSelectCls =
  'w-full rounded-[10px] border border-[#e6e9f2] bg-white px-3 py-[9px] text-sm text-[#1a2233] transition focus:border-primary-500 focus:outline-none focus:shadow-[0_0_0_3px_rgba(47,107,255,0.12)]';
const btnCls =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-transparent px-4 py-[9px] text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const btnSuccessCls = `${btnCls} bg-[#22b573] text-white enabled:hover:bg-[#1d9e66]`;
const btnDangerCls = `${btnCls} bg-[#ef4b4b] text-white enabled:hover:bg-[#d93b3b]`;
const reqListCls = 'grid gap-3';
const reqCardCls =
  'flex flex-col gap-2 rounded-xl border border-[#e6e9f2] bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition hover:shadow-[0_6px_16px_rgba(16,24,40,0.08)]';
const reqCardHeadCls = 'flex items-center justify-between gap-2.5';
const reqHeadSideCls = 'flex min-w-0 items-center gap-2';
const reqMetaCls = 'text-[13px] text-[#7a8499]';
const reqMetaDangerCls = 'text-[13px] text-[#ef4b4b]';
const reqDatesCls = 'font-semibold';
const reqActionsCls = 'mt-1 flex gap-2 border-t border-[#e6e9f2] pt-3';
const labelCls = 'mb-1.5 block text-[13px] font-semibold text-[#1a2233]';
const inputCls = `${formSelectCls} min-h-[80px] resize-y`;
const btnSecondaryCls = `${btnCls} border-[#e6e9f2] bg-white text-[#1a2233] enabled:hover:border-[#d5dbe8] enabled:hover:bg-[#f6f8fc]`;

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

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  ...toOptions(REQUEST_STATUSES),
];
const TYPE_OPTIONS = toOptions(REQUEST_TYPES);

export default function ApprovalsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('pending');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await requestApi.list({
        all: 1,
        status: status || undefined,
        type: type || undefined,
      });
      setRequests(listOf(res));
    } catch (err) {
      toast.error(extractError(err));
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [status, type, toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Action modal: { kind: 'approve' | 'reject', request } or null.
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');

  const openAction = (kind, request) => {
    setAction({ kind, request });
    setReason('');
  };

  const closeAction = () => {
    setAction(null);
    setReason('');
  };

  const submitAction = async (e) => {
    e?.preventDefault();
    if (!action || busy) return;
    setBusy(true);
    try {
      const res =
        action.kind === 'approve'
          ? await requestApi.approve(action.request.id)
          : await requestApi.reject(action.request.id, reason);
      toast.success(
        res?.data?.message ??
          res?.message ??
          (action.kind === 'approve' ? 'Đã duyệt đơn' : 'Đã từ chối đơn')
      );
      closeAction();
      loadRequests();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[1200px]">
      <div className={pageHeaderCls}>
        <h2 className={pageTitleCls}>Duyệt đơn</h2>
      </div>

      {/* Filter tabs */}
      <Tabs options={STATUS_OPTIONS} value={status} onChange={setStatus} />

      <div className={filtersCls}>
        <select
          className={formSelectCls}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Tất cả loại</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : requests.length === 0 ? (
        <EmptyState text="Không có đơn nào" />
      ) : (
        <div className={reqListCls}>
          {requests.map((r) => (
            <div className={reqCardCls} key={r.id}>
              <div className={reqCardHeadCls}>
                <div className={reqHeadSideCls}>
                  <Avatar name={r.user?.name} sm />
                  <div>
                    <div>{r.user?.name || '—'}</div>
                    <div className={reqMetaCls}>{fmtDate(r.created_at)}</div>
                  </div>
                </div>
                <div className={reqHeadSideCls}>
                  <TypeChip type={r.type} />
                  <StatusBadge status={r.status} />
                </div>
              </div>

              <div className={reqDatesCls}>
                {fmtDate(r.start_date)} → {fmtDate(r.end_date)}
              </div>
              {r.start_time && r.end_time && (
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
                <div className={reqMetaDangerCls}>
                  Lý do từ chối: {r.reject_reason}
                </div>
              )}

              {r.status === 'pending' && (
                <div className={reqActionsCls}>
                  <button
                    type="button"
                    className={btnSuccessCls}
                    disabled={busy}
                    onClick={() => openAction('approve', r)}
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    className={btnDangerCls}
                    disabled={busy}
                    onClick={() => openAction('reject', r)}
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve / Reject modal */}
      <Modal
        open={!!action}
        onClose={closeAction}
        title={
          action?.kind === 'approve' ? 'Xác nhận duyệt đơn' : 'Từ chối đơn'
        }
      >
        {action && (
          <form onSubmit={submitAction}>
            {/* Request summary */}
            <div className="mb-4 rounded-[10px] border border-[#e6e9f2] bg-[#f8fafd] p-3">
              <div className="flex items-center gap-2">
                <Avatar name={action.request.user?.name} sm />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">
                    {action.request.user?.name || '—'}
                  </div>
                  <div className={reqMetaCls}>
                    {fmtDate(action.request.start_date)} →{' '}
                    {fmtDate(action.request.end_date)}
                    {action.request.start_time &&
                      action.request.end_time &&
                      ` · ${fmtTime(action.request.start_time)}–${fmtTime(action.request.end_time)}`}
                  </div>
                </div>
                <TypeChip type={action.request.type} />
              </div>
              {action.request.reason && (
                <div className={`${reqMetaCls} mt-2`}>
                  {action.request.reason}
                </div>
              )}
            </div>

            {action.kind === 'reject' && (
              <div className="mb-3.5">
                <label className={labelCls}>Lý do từ chối *</label>
                <textarea
                  className={inputCls}
                  placeholder="Nhập lý do từ chối..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  minLength={3}
                  autoFocus
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className={btnSecondaryCls}
                onClick={closeAction}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={
                  action.kind === 'approve' ? btnSuccessCls : btnDangerCls
                }
                disabled={busy}
              >
                {busy
                  ? 'Đang xử lý...'
                  : action.kind === 'approve'
                    ? 'Xác nhận duyệt'
                    : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
