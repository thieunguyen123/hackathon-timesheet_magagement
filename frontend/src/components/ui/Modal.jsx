export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,27,45,0.5)] p-5 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(16,24,40,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? <h3 className="text-lg font-bold">{title}</h3> : <span />}
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-lg leading-none text-[#7a8499] transition-colors duration-150 hover:bg-[#f4f6fb] hover:text-[#1a2233]"
          >
            ✕
          </button>
        </div>
        {children}
        {footer && <div className="mt-4 flex items-center gap-2">{footer}</div>}
      </div>
    </div>
  )
}
