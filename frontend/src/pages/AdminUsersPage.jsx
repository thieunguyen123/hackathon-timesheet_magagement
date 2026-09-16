import { useCallback, useEffect, useState } from 'react';
import { userApi } from '../api';
import { EmptyState, Loading, Modal, Pagination } from '../components/ui';
import { GENDERS, ROLES } from '../constants';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { useModal } from '../hooks/useModal';
import { extractError, fmtDate, normalizeList } from '../utils/format';

// Tailwind class strings replicating the legacy theme in styles.css.
const pageCls = 'max-w-[1200px]';
const pageHeaderCls =
  'flex items-center justify-between flex-wrap gap-3 mb-5';
const pageTitleCls = 'text-[22px] font-bold tracking-[-0.02em]';
const cardCls =
  'bg-white rounded-xl border border-[#e6e9f2] shadow-[0_1px_3px_rgba(16,24,40,0.06)] p-5 mb-5';
const filtersCls = 'flex flex-wrap items-end gap-3 mb-4';
const actionsCls = 'flex items-center gap-2';

const btnBaseCls =
  'inline-flex items-center justify-center gap-1.5 px-4 py-[9px] border border-transparent rounded-[10px] text-sm font-semibold whitespace-nowrap transition disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimaryCls = `${btnBaseCls} bg-primary-500 text-white shadow-[0_2px_6px_rgba(47,107,255,0.25)] hover:bg-[#2058e0]`;
const btnSecondaryCls = `${btnBaseCls} bg-white border-[#e6e9f2] text-[#1a2233] hover:bg-[#f6f8fc] hover:border-[#d5dbe8]`;
const btnSmBaseCls =
  'inline-flex items-center justify-center gap-1.5 px-3 py-[5px] border rounded-lg text-[13px] font-semibold whitespace-nowrap transition disabled:opacity-60 disabled:cursor-not-allowed';
const btnSecondarySmCls = `${btnSmBaseCls} bg-white border-[#e6e9f2] text-[#1a2233] hover:bg-[#f6f8fc] hover:border-[#d5dbe8]`;
const btnDangerSmCls = `${btnSmBaseCls} border-transparent bg-[#ef4b4b] text-white hover:bg-[#d93b3b]`;

const tableCls = 'w-full border-collapse';
const tbodyCls = '[&>tr:last-child>td]:border-b-0';
const trCls = 'transition-colors hover:bg-[#f8fafd]';
const thCls =
  'px-[14px] py-[11px] border-b border-[#e6e9f2] text-left align-middle bg-[#fafbfe] text-[11px] font-bold uppercase tracking-[0.05em] text-[#7a8499]';
const tdCls =
  'px-[14px] py-[11px] border-b border-[#e6e9f2] text-left align-middle';

const badgeBaseCls =
  'inline-flex items-center px-[10px] py-[3px] rounded-full text-xs font-semibold whitespace-nowrap';
const roleBadgeCls = (r) =>
  `${badgeBaseCls} ${
    r === 'admin'
      ? 'bg-[#fdeaea] text-[#cf3a3a]'
      : r === 'manager'
        ? 'bg-[#f4f0ff] text-[#7c5cfc]'
        : 'bg-[#eef1f7] text-[#5b6478]'
  }`;

const formGroupCls = 'mb-3.5';
const formLabelCls = 'block mb-1.5 text-[13px] font-semibold text-[#1a2233]';
const formFieldCls =
  'w-full px-3 py-[9px] border border-[#e6e9f2] rounded-[10px] text-sm text-[#1a2233] bg-white transition focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(47,107,255,0.12)]';
const formSelectCls = `${formFieldCls} appearance-auto`;

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  manager_id: '',
  annual_leave_days: 12,
  gender: 'male',
  start_date: '',
};

// Constants may be { key: { label } } maps or arrays of { value, label }.
const toOptions = (c) =>
  Array.isArray(c)
    ? c
    : Object.entries(c || {}).map(([value, v]) => ({
        value,
        label: v?.label ?? v,
      }));

const roleLabel = (r) => ROLES?.[r]?.label ?? ROLES?.[r] ?? r;

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

const ROLE_OPTIONS = toOptions(ROLES);
// GENDERS is exported from '../constants'; fall back defensively if absent.
const GENDER_OPTIONS = toOptions(GENDERS).length
  ? toOptions(GENDERS)
  : [
      { value: 'male', label: 'Nam' },
      { value: 'female', label: 'Nữ' },
    ];

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [qInput, setQInput] = useState('');
  const qDebounced = useDebounce(qInput, 400);
  const q = Array.isArray(qDebounced) ? qDebounced[0] : qDebounced;
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const modal = useModalControls();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Debounced search resets to the first page.
  useEffect(() => {
    setPage(1);
  }, [q]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.list({ q, role, page });
      const pg = res?.data ?? res ?? {};
      setUsers(
        Array.isArray(pg?.data) ? pg.data : Array.isArray(pg) ? pg : [],
      );
      setCurrentPage(pg?.meta?.current_page ?? pg?.current_page ?? 1);
      setLastPage(pg?.meta?.last_page ?? pg?.last_page ?? 1);
    } catch (err) {
      toast.error(extractError(err, 'Không thể tải danh sách nhân viên'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    userApi
      .team()
      .then((res) =>
        setManagers(listOf(res).filter((u) => u.role === 'manager')),
      )
      .catch(() => {});
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, start_date: todayStr() });
    modal.openModal();
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'user',
      manager_id: u.manager_id || '',
      annual_leave_days: u.annual_leave_days ?? 12,
      gender: u.gender || '',
      start_date: u.start_date || '',
    });
    modal.openModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        manager_id: form.manager_id || null,
        annual_leave_days:
          form.annual_leave_days === '' ? 0 : Number(form.annual_leave_days),
      };
      if (form.password) payload.password = form.password;
      if (editing) {
        // Optional on update — only send when the form carries values.
        if (form.gender) payload.gender = form.gender;
        if (form.start_date) payload.start_date = form.start_date;
        await userApi.update(editing.id, payload);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        // Required on create.
        payload.gender = form.gender;
        payload.start_date = form.start_date;
        payload.password = form.password;
        await userApi.create(payload);
        toast.success('Thêm nhân viên thành công');
      }
      modal.closeModal();
      loadUsers();
    } catch (err) {
      toast.error(extractError(err, 'Lưu nhân viên thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${u.name}"?`)) return;
    try {
      await userApi.remove(u.id);
      toast.success('Đã xóa nhân viên');
      loadUsers();
    } catch (err) {
      toast.error(extractError(err, 'Xóa nhân viên thất bại'));
    }
  };

  return (
    <div className={pageCls}>
      <div className={pageHeaderCls}>
        <h2 className={pageTitleCls}>Quản lý nhân viên</h2>
        <button className={btnPrimaryCls} onClick={openCreate}>
          + Thêm nhân viên
        </button>
      </div>

      <div className={cardCls}>
        <div className={filtersCls}>
          <input
            className={formFieldCls}
            placeholder="Tìm theo tên hoặc email..."
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
          />
          <select
            className={formSelectCls}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả vai trò</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loading />
        ) : users.length === 0 ? (
          <EmptyState text="Không có nhân viên nào" />
        ) : (
          <>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Tên</th>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Giới tính</th>
                  <th className={thCls}>Vai trò</th>
                  <th className={thCls}>Quản lý</th>
                  <th className={thCls}>Phép/năm</th>
                  <th className={thCls}>Thao tác</th>
                </tr>
              </thead>
              <tbody className={tbodyCls}>
                {users.map((u) => (
                  <tr key={u.id} className={trCls}>
                    <td className={tdCls}>{u.name}</td>
                    <td className={tdCls}>
                      {u.email}
                      <div className="text-xs text-slate-400">
                        Bắt đầu: {fmtDate(u.start_date)}
                      </div>
                    </td>
                    <td className={tdCls}>{u.gender_label || '—'}</td>
                    <td className={tdCls}>
                      <span className={roleBadgeCls(u.role)}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className={tdCls}>{u.manager?.name || '—'}</td>
                    <td className={tdCls}>{u.annual_leave_days ?? '—'}</td>
                    <td className={tdCls}>
                      <div className={actionsCls}>
                        <button
                          className={btnSecondarySmCls}
                          onClick={() => openEdit(u)}
                        >
                          Sửa
                        </button>
                        <button
                          className={btnDangerSmCls}
                          onClick={() => handleDelete(u)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              page={currentPage}
              lastPage={lastPage}
              onChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={modal.closeModal}
        title={editing ? 'Sửa nhân viên' : 'Thêm nhân viên'}
      >
        <form onSubmit={handleSubmit}>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Tên</label>
            <input
              className={formFieldCls}
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Email</label>
            <input
              type="email"
              className={formFieldCls}
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Mật khẩu</label>
            <input
              type="password"
              className={formFieldCls}
              name="password"
              value={form.password}
              onChange={onChange}
              required={!editing}
            />
            {editing && (
              <small className="text-xs text-[#7a8499]">
                để trốn nếu không đổi
              </small>
            )}
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Vai trò</label>
            <select
              className={formSelectCls}
              name="role"
              value={form.role}
              onChange={onChange}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Quản lý</label>
            <select
              className={formSelectCls}
              name="manager_id"
              value={form.manager_id}
              onChange={onChange}
            >
              <option value="">— Không có —</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Giới tính</label>
            <select
              className={formSelectCls}
              name="gender"
              value={form.gender}
              onChange={onChange}
              required={!editing}
            >
              <option value="" disabled>
                — Chọn —
              </option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            {form.gender && (
              <small className="text-slate-400 text-xs">
                {form.gender === 'female'
                  ? 'Phép năm tối đa 18 ngày (1.5 ngày/tháng)'
                  : 'Phép năm tối đa 12 ngày (1 ngày/tháng)'}
              </small>
            )}
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Ngày bắt đầu</label>
            <input
              type="date"
              className={formFieldCls}
              name="start_date"
              value={form.start_date}
              onChange={onChange}
              required={!editing}
            />
          </div>
          <div className={formGroupCls}>
            <label className={formLabelCls}>Phép/năm</label>
            <input
              type="number"
              min="0"
              className={formFieldCls}
              name="annual_leave_days"
              value={form.annual_leave_days}
              onChange={onChange}
            />
          </div>
          <div className={actionsCls}>
            <button
              type="button"
              className={btnSecondaryCls}
              onClick={modal.closeModal}
            >
              Hủy
            </button>
            <button type="submit" className={btnPrimaryCls} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
