import { useEffect, useMemo, useState } from 'react';
import { attendanceApi, requestApi, userApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ui';
import { REQUEST_TYPES, ROLES, WORK } from '../constants';
import { extractError, fmtTime, normalizeList } from '../utils/format';
import {
  expandRequestsToDateMap,
  isToday,
  isWeekend,
  monthCells,
  toKey,
} from '../utils/calendar';

const pad = (n) => String(n).padStart(2, '0');

const parseYMD = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

const shiftMonth = (month, delta) => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

// ISO datetime -> local minutes since midnight (null when missing/invalid)
const minutesOf = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
};

const round1 = (n) => Math.round(n * 10) / 10;

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// WORK constants may be expressed as 'HH:mm' or minutes — normalize to minutes.
const toMinutes = (v, fallback) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const m = /^(\d{1,2}):(\d{2})/.exec(String(v ?? ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : fallback;
};

const STANDARD_HOURS = WORK.STANDARD_HOURS ?? 8;
const LATE_AFTER = toMinutes(
  WORK.LATE_AFTER ?? WORK.LATE_AFTER_MINUTES,
  8 * 60 + 30
); // 08:30
const EARLY_BEFORE = toMinutes(
  WORK.EARLY_BEFORE ?? WORK.EARLY_BEFORE_MINUTES,
  17 * 60 + 30
); // 17:30

const ROLE_ADMIN = ROLES.ADMIN ?? 'admin';
const ROLE_MANAGER = ROLES.MANAGER ?? 'manager';

const REQ_OFF = REQUEST_TYPES.OFF ?? 'off';
const REQ_REMOTE = REQUEST_TYPES.REMOTE ?? 'remote';
const REQ_OT = REQUEST_TYPES.OT ?? 'ot';

// --- Tailwind class strings (migrated from styles.css) ---
// All buttons on this page use the .btn-sm sizing (padding/radius/font-size
// live in BTN_SM so no conflicting utilities are emitted on one element).
const BTN_BASE =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
const BTN_SM = 'rounded-lg px-3 py-[5px] text-[13px]';
const BTN_PRIMARY = `${BTN_BASE} ${BTN_SM} border-transparent bg-primary-500 text-white shadow-[0_2px_6px_rgba(47,107,255,0.25)] enabled:hover:bg-[#2058e0]`;
const BTN_SECONDARY = `${BTN_BASE} ${BTN_SM} border-[#e6e9f2] bg-white text-[#1a2233] enabled:hover:border-[#d5dbe8] enabled:hover:bg-[#f6f8fc]`;
const FORM_SELECT =
  'w-full appearance-auto rounded-[10px] border border-[#e6e9f2] bg-white px-3 py-[9px] text-[14px] text-[#1a2233] transition focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(47,107,255,0.12)] focus:outline-none';
const CAL_HEAD =
  'border-b border-[#e6e9f2] bg-[#fafbfe] px-1 py-2 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-[#7a8499]';
const CAL_CELL =
  'relative flex min-h-[110px] flex-col border-b border-[#e6e9f2] p-1.5 text-[13px] max-[768px]:min-h-[80px] max-[768px]:p-1';
const CAL_DATE =
  'absolute right-2 top-1.5 text-[11px] font-semibold text-[#7a8499]';
const CAL_BODY =
  'mt-3.5 flex flex-1 flex-col items-center justify-center gap-0.5 text-center';
const CAL_HOURS = 'text-[16px] font-bold max-[768px]:text-[14px]';
const CAL_TIMES = 'text-[12px] text-[#5b6478] max-[768px]:text-[11px]';
const CAL_SUB = 'text-[11px] text-[#7a8499] max-[768px]:hidden';
const CAL_LEAVE_TEXT = 'font-bold text-[#ef4b4b]';
const CAL_OT = 'text-[12px] font-semibold text-[#f5a623]';
const CAL_DOT = 'text-center text-[20px] leading-none text-[#c4cad6]';
const CHIP_REMOTE =
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#f4f0ff] px-2.5 py-[3px] text-[12px] font-semibold text-[#7c5cfc]';
const LEGEND_DOT = 'mr-[5px] inline-block h-2 w-2 rounded-full align-middle';
const SUMMARY_ROW =
  'flex items-center justify-between gap-2 border-b border-[#f0f2f8] px-4 py-2 text-[13px] last:border-b-0';

export default function AttendancePage() {
  const { user } = useAuth();
  const toast = useToast();
  const canPick = user?.role === ROLE_ADMIN || user?.role === ROLE_MANAGER;

  const [month, setMonth] = useState(() => toKey(new Date()).slice(0, 7)); // 'YYYY-MM'
  const [selectedUser, setSelectedUser] = useState(user?.id || '');
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (user?.id) setSelectedUser((prev) => prev || user.id);
  }, [user]);

  useEffect(() => {
    if (!canPick) return;
    userApi
      .team()
      .then((res) => setUsers(res?.data || []))
      .catch(() => {});
  }, [canPick]);

  useEffect(() => {
    if (!selectedUser) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      attendanceApi.list({ month, user_id: selectedUser }),
      requestApi.list({ all: 1, status: 'approved', user_id: selectedUser }),
    ])
      .then(([aRes, rRes]) => {
        if (cancelled) return;
        setRows(aRes?.data || []);
        setRequests(normalizeList(rRes));
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(extractError(err, 'Không thể tải dữ liệu chấm công'));
        setRows([]);
        setRequests([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, selectedUser, reloadKey]);

  const [year, monthNum] = month.split('-').map(Number);
  const todayKey = toKey(new Date());

  // Weeks start on Monday and cover the whole month, including
  // leading/trailing days of adjacent months.
  const cells = useMemo(() => monthCells(month), [month]);

  const attendanceByDate = useMemo(() => {
    const map = {};
    rows.forEach((a) => {
      if (a.date) map[String(a.date).slice(0, 10)] = a;
    });
    return map;
  }, [rows]);

  const requestByDate = useMemo(
    () =>
      expandRequestsToDateMap(
        requests.filter((r) => Number(r.user_id) === Number(selectedUser))
      ),
    [requests, selectedUser]
  );

  const summary = useMemo(() => {
    let days = 0;
    let totalHours = 0;
    let lateCount = 0;
    let lateMinutes = 0;
    let earlyCount = 0;
    rows.forEach((a) => {
      days += 1;
      totalHours += Number(a.work_hours) || 0;
      const ci = minutesOf(a.check_in);
      if (ci != null && ci > LATE_AFTER) {
        lateCount += 1;
        lateMinutes += ci - LATE_AFTER;
      }
      const co = minutesOf(a.check_out);
      if (co != null && co < EARLY_BEFORE) earlyCount += 1;
    });
    let otHours = 0;
    let offDays = 0;
    let remoteDays = 0;
    requestByDate.forEach((r, k) => {
      if (!k.startsWith(`${month}-`)) return;
      if (r.type === REQ_OT) {
        otHours += Number(r.hours) || 0;
      } else if (r.type === REQ_OFF) {
        if (!isWeekend(parseYMD(k))) offDays += 1;
      } else if (r.type === REQ_REMOTE) {
        remoteDays += 1;
      }
    });
    return {
      days,
      totalHours,
      lateCount,
      lateMinutes,
      earlyCount,
      otHours,
      offDays,
      remoteDays,
    };
  }, [rows, requestByDate, month]);

  const pickerUsers = useMemo(() => {
    const rest = users.filter((u) => Number(u.id) !== Number(user?.id));
    return user ? [{ id: user.id, name: user.name }, ...rest] : rest;
  }, [users, user]);

  if (!user) return <Loading />;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await attendanceApi.sync();
      toast.success('Đã đồng bộ dữ liệu demo');
      setReloadKey((v) => v + 1);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSyncing(false);
    }
  };

  const renderCell = (d, inMonth) => {
    const k = toKey(d);
    const att = attendanceByDate[k];
    const req = requestByDate.get(k);
    const isOff = req?.type === REQ_OFF;
    const isRemote = req?.type === REQ_REMOTE;
    const isOt = req?.type === REQ_OT;
    const weekend = isWeekend(d);
    const other = !inMonth;
    const today = isToday(d);
    const pastOrToday = k <= todayKey;
    const wh = att ? Number(att.work_hours) || 0 : 0;
    const ok = wh >= STANDARD_HOURS;
    const hasContent = isOff || isRemote || !!att || isOt;

    // Cell background follows the old stylesheet's cascade order:
    // other > remote > leave > today > weekend > default white.
    const cellBg = other
      ? 'bg-[#fbfbfc] text-[#7a8499]'
      : isRemote
        ? 'bg-[#f4f0ff]'
        : isOff
          ? 'bg-[#fffbe6]'
          : today
            ? 'bg-[#fff7ec]'
            : weekend
              ? 'bg-[#f7f8fc]'
              : 'bg-white';
    const cls = [
      CAL_CELL,
      // Weeks start on Monday -> Sunday (getDay()===0) is the 7th column,
      // which has no right border in the old CSS (:nth-child(7n)).
      d.getDay() === 0 ? 'border-r-0' : 'border-r',
      cellBg,
      today &&
        'outline outline-1 -outline-offset-[1px] outline-primary-500',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={k} className={cls}>
        <div className={CAL_DATE}>
          {d.getDate()}/{d.getMonth() + 1}
        </div>
        <div className={CAL_BODY}>
          {isOff && (
            <>
              <div className={CAL_LEAVE_TEXT}>NL</div>
              <div className={CAL_SUB}>Nghỉ phép</div>
            </>
          )}
          {isRemote && <span className={CHIP_REMOTE}>Remote</span>}
          {att && (
            <>
              <div
                className={`${CAL_HOURS} ${
                  ok ? 'text-[#1f7a4d]' : 'text-[#ef4b4b]'
                }`}
              >
                {round1(wh)}
                {ok ? ' ✓' : ''}
              </div>
              <div className={CAL_TIMES}>
                {fmtTime(att.check_in)} - {fmtTime(att.check_out)}
              </div>
              <div className={CAL_SUB}>Công: {round1(wh / STANDARD_HOURS)}</div>
              {wh < STANDARD_HOURS && (
                <div className={CAL_SUB} style={{ color: '#dc2626' }}>
                  Thiếu {round1(STANDARD_HOURS - wh)}h
                </div>
              )}
              {wh > STANDARD_HOURS && (
                <div className={CAL_SUB}>OT +{round1(wh - STANDARD_HOURS)}h</div>
              )}
            </>
          )}
          {!att && isOt && (
            <>
              <div className={CAL_OT}>☆ {round1(Number(req.hours) || 0)}h</div>
              <div className={CAL_SUB}>
                {fmtTime(req.start_time)} - {fmtTime(req.end_time)}
              </div>
            </>
          )}
          {!hasContent && !weekend && !other && pastOrToday && (
            <div className={CAL_DOT}>•</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-[-0.02em]">Chấm công</h2>
        {canPick && (
          <button
            type="button"
            className={BTN_PRIMARY}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? 'Đang đồng bộ…' : 'Đồng bộ demo'}
          </button>
        )}
        {canPick && (
          <select
            className={FORM_SELECT}
            value={selectedUser}
            onChange={(e) => setSelectedUser(Number(e.target.value))}
          >
            {pickerUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
                {Number(u.id) === Number(user.id) ? ' (Tôi)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-start gap-4 max-[1024px]:flex-col">
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#e6e9f2] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
          <div className="flex items-center justify-between gap-2.5 px-4 py-3">
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setMonth(shiftMonth(month, -1))}
            >
              ‹
            </button>
            <h3 className="text-[16px] font-bold tracking-[-0.01em]">
              Tháng {monthNum} / {year}
            </h3>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => setMonth(shiftMonth(month, 1))}
            >
              ›
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-7 border-t border-[#e6e9f2]">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={`${CAL_HEAD} ${
                    i === WEEKDAYS.length - 1 ? 'border-r-0' : 'border-r'
                  }`}
                >
                  {w}
                </div>
              ))}
              {cells.map((cell) => renderCell(cell.date, cell.inMonth))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3.5 px-4 py-2 text-[12px] text-[#7a8499]">
            <span>
              <span className={`${LEGEND_DOT} bg-[#f2c94c]`} /> Nghỉ phép
            </span>
            <span>
              <span className={`${LEGEND_DOT} bg-[#7c5cfc]`} /> Remote
            </span>
            <span>
              <span className={`${LEGEND_DOT} bg-[#d3d9e6]`} /> Cuối tuần
            </span>
            <span>
              <span className={`${LEGEND_DOT} bg-[#ff8a3d]`} /> Hôm nay
            </span>
          </div>
        </div>

        <aside className="sticky top-4 w-[230px] shrink-0 rounded-xl border border-[#e6e9f2] bg-white py-3 shadow-[0_1px_3px_rgba(16,24,40,0.06)] max-[1024px]:static max-[1024px]:w-full">
          <div className="px-4 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#7a8499]">
            Tổng kết tháng
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Số ngày công</span>
            <span className="font-semibold">{summary.days}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Tổng giờ làm</span>
            <span className="font-semibold">{summary.totalHours.toFixed(1)}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Số lần đi muộn</span>
            <span className="font-semibold">{summary.lateCount}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Tổng phút đi muộn</span>
            <span className="font-semibold">{summary.lateMinutes}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Số lần về sớm</span>
            <span className="font-semibold">{summary.earlyCount}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Giờ OT</span>
            <span className="font-semibold">{round1(summary.otHours)}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Ngày phép đã dùng</span>
            <span className="font-semibold">{summary.offDays}</span>
          </div>
          <div className={SUMMARY_ROW}>
            <span className="text-[#7a8499]">Ngày remote</span>
            <span className="font-semibold">{summary.remoteDays}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
