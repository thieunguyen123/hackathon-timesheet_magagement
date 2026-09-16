import { useToast } from '../../context/ToastContext'

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-amber-500 text-white',
}

const iconPaths = {
  success: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
}

function ToastIcon({ type }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5 shrink-0"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[type]} />
    </svg>
  )
}

export default function Toaster() {
  const { toasts, removeToast } = useToast()

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          aria-live="polite"
          className={`toast-enter pointer-events-auto rounded-lg shadow-lg px-4 py-3 text-sm font-medium min-w-[280px] max-w-[480px] flex items-center justify-between gap-3 ${typeStyles[toast.type] || typeStyles.info}`}
        >
          <span className="flex items-center gap-2">
            <ToastIcon type={toast.type} />
            <span>{toast.message}</span>
          </span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="opacity-70 hover:opacity-100 text-lg leading-none"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
