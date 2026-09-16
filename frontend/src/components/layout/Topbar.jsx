import NotificationBell from './NotificationBell'

const roleBadgeClass = {
  admin: 'bg-[#fdeaea] text-[#cf3a3a]',
  manager: 'bg-[#f4f0ff] text-[#7c5cfc]',
  user: 'bg-[#eef1f7] text-[#5b6478]',
}

export default function Topbar({ user, roleLabel, onLogout }) {
  return (
    <header className="sticky top-0 z-[15] flex items-center justify-end border-b border-[#e6e9f2] bg-white px-6 py-3 max-[768px]:static">
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="font-semibold">{user?.name}</span>
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${
            roleBadgeClass[user?.role] || ''
          }`}
        >
          {roleLabel || user?.role}
        </span>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e6e9f2] bg-white px-3 py-[5px] text-[13px] font-semibold text-[#1a2233] no-underline transition-colors duration-150 hover:border-[#d5dbe8] hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onLogout}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
