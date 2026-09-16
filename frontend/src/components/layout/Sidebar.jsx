import { NavLink } from 'react-router-dom'
import { ROLES, ROUTES } from '../../constants'

const linkBase =
  'relative flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 font-medium no-underline transition-colors duration-150'
const linkActive =
  'bg-[#eaf0ff] font-semibold text-[#2f6bff] before:absolute before:bottom-[7px] before:left-[-12px] before:top-[7px] before:w-1 before:rounded-r before:bg-[#2f6bff] before:content-[""] max-[768px]:before:hidden'
const linkInactive = 'text-[#5b6478] hover:bg-[#f4f6fb] hover:text-[#1a2233]'

const navLinkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? linkActive : linkInactive}`

export default function Sidebar({ user }) {
  const role = user?.role
  const isApprover = role === ROLES.manager.value || role === ROLES.admin.value
  const isAdmin = role === ROLES.admin.value

  return (
    <aside className="sticky top-0 z-20 flex h-screen w-[240px] shrink-0 flex-col overflow-y-auto border-r border-[#e6e9f2] bg-white max-[768px]:static max-[768px]:h-auto max-[768px]:w-full max-[768px]:border-b max-[768px]:border-r-0">
      <div className="flex items-center gap-2.5 border-b border-[#e6e9f2] px-5 py-[18px] text-[19px] font-extrabold tracking-[-0.02em] text-[#1a2233] max-[768px]:border-b-0 max-[768px]:px-4 max-[768px]:pb-1.5 max-[768px]:pt-3.5">
        <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#2f6bff] to-[#6d9bff] text-[15px] font-extrabold text-white shadow-[0_3px_8px_rgba(47,107,255,0.35)]">
          T
        </span>
        Timesheet
      </div>
      <nav className="flex flex-col gap-0.5 p-3 max-[768px]:flex-row max-[768px]:flex-wrap max-[768px]:pt-2">
        <NavLink to={ROUTES.DASHBOARD} end className={navLinkClass}>
          Tổng quan
        </NavLink>
        <NavLink to={ROUTES.ATTENDANCE} className={navLinkClass}>
          Chấm công
        </NavLink>
        <NavLink to={ROUTES.REQUESTS} className={navLinkClass}>
          Đơn của tôi
        </NavLink>
        {isApprover && (
          <NavLink to={ROUTES.APPROVALS} className={navLinkClass}>
            Duyệt đơn
          </NavLink>
        )}
        {isAdmin && (
          <>
            <div className="px-3.5 pb-1.5 pt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-[#7a8499] max-[768px]:w-full">
              Quản trị
            </div>
            <NavLink to={ROUTES.ADMIN_USERS} className={navLinkClass}>
              Nhân viên
            </NavLink>
            <NavLink to={ROUTES.ADMIN_REPORTS} className={navLinkClass}>
              Báo cáo
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}
