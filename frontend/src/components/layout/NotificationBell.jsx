import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../../api'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const then = new Date(dateStr)
  if (Number.isNaN(then.getTime())) return ''
  const minutes = Math.floor((Date.now() - then.getTime()) / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hôm qua'
  if (days < 7) return `${days} ngày trước`
  return then.toLocaleDateString('vi-VN')
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  // Poll unread count every 30s
  useEffect(() => {
    let mounted = true
    const fetchCount = async () => {
      try {
        const res = await notificationApi.unreadCount()
        if (mounted) setCount(res?.count ?? 0)
      } catch {
        // ignore polling errors
      }
    }
    fetchCount()
    const timer = setInterval(fetchCount, 30000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return undefined
    const onMouseDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.list()
      setItems(res?.data ?? [])
      if (res?.unread_count != null) setCount(res.unread_count)
    } catch {
      // ignore fetch errors
    } finally {
      setLoading(false)
    }
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) fetchList()
  }

  const onMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      const res = await notificationApi.list()
      setItems(res?.data ?? [])
      setCount(res?.unread_count ?? 0)
    } catch {
      // ignore errors
    }
  }

  const onItemClick = async (n) => {
    try {
      await notificationApi.markRead(n.id)
    } catch {
      // ignore errors
    }
    setItems((prev) =>
      prev.map((it) =>
        it.id === n.id ? { ...it, read_at: it.read_at || new Date().toISOString() } : it,
      ),
    )
    if (!n.read_at) setCount((c) => Math.max(0, c - 1))
    setOpen(false)
    navigate(n.link || '/requests')
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Thông báo"
        className="relative rounded-full p-2 hover:bg-slate-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-slate-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <span className="font-semibold text-slate-800">Thông báo</span>
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              Đánh dấu đã đọc
            </button>
          </div>

          <div className="notif-list max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Đang tải…</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Chưa có thông báo nào
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onItemClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-3 border-b border-slate-100 last:border-0 ${
                    n.read_at ? 'opacity-70' : ''
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 ${
                      n.read_at ? 'invisible' : ''
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">
                      {n.title}
                    </span>
                    <span className="block text-xs text-slate-500 line-clamp-2">
                      {n.message}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {timeAgo(n.created_at)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
