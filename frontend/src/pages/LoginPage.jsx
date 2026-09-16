import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ROUTES } from '../constants'
import { extractError } from '../utils/format'

const FEATURES = [
  'Chấm công tự động',
  'Đơn nghỉ phép, remote, OT',
  'Duyệt đơn theo vai trò',
]

function ClockIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const { error } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      error(extractError(err, 'Đăng nhập thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fb] min-[860px]:flex-row">
      {/* Slim brand bar — mobile only */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-[#1e3a8a] to-[#2f6bff] px-5 py-4 text-white min-[860px]:hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15">
          <ClockIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-extrabold leading-tight tracking-tight">Timesheet</div>
          <div className="text-xs text-white/70">Quản lý chấm công &amp; đơn từ</div>
        </div>
      </div>

      {/* Brand panel — desktop only */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1e3a8a] to-[#2f6bff] px-12 text-white min-[860px]:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#0f172a]/25 blur-3xl" />

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm">
            <ClockIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Timesheet</h1>
          <p className="mt-2 text-[15px] text-white/80">Quản lý chấm công &amp; đơn từ</p>

          <ul className="mt-10 space-y-4 self-start text-left">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium text-white/90">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px] rounded-2xl border border-[#e6e9f2] bg-white p-10 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
          <p className="mb-6 mt-1 text-sm text-[#7a8499]">Chào mừng trở lại</p>

          <form onSubmit={onSubmit}>
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-semibold text-[#1a2233]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-[10px] border border-[#e6e9f2] px-3 py-[9px] text-sm focus:shadow-[0_0_0_3px_rgba(47,107,255,0.12)] focus:outline-none"
                placeholder="name@company.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-semibold text-[#1a2233]" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-[10px] border border-[#e6e9f2] px-3 py-[9px] text-sm focus:shadow-[0_0_0_3px_rgba(47,107,255,0.12)] focus:outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary-500 px-4 py-[9px] text-sm font-semibold text-white shadow-[0_2px_6px_rgba(47,107,255,0.25)] transition enabled:hover:bg-[#2058e0] disabled:opacity-60" disabled={submitting}>
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[#7a8499]">
            Demo: admin@timesheet.dev / password
          </p>
        </div>
      </div>
    </div>
  )
}
