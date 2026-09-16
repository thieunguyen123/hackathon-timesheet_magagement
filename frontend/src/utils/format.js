// Shared display-formatting helpers. All functions are pure and null-safe.

const pad2 = (n) => String(n).padStart(2, '0')

const toLocalDate = (d) => {
  if (d instanceof Date) return d
  if (typeof d === 'string') {
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  return new Date(d)
}

/** Date | 'YYYY-MM-DD' | ISO string -> 'dd/mm/yyyy' (vi-VN) */
export function fmtDate(d) {
  if (!d) return '—'
  const date = toLocalDate(d)
  if (Number.isNaN(date.getTime())) return '—'
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
}

/** ISO datetime | 'HH:mm[:ss]' | Date -> 'HH:mm' ('—' when falsy/invalid) */
export function fmtTime(iso) {
  if (!iso) return '—'
  if (typeof iso === 'string') {
    // Wall-clock time taken verbatim to avoid timezone shifts on timesheet data.
    const t = iso.match(/^(?:\d{4}-\d{2}-\d{2}[T ])?(\d{2}:\d{2})/)
    if (t) return t[1]
  }
  const date = iso instanceof Date ? iso : new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/** Two dates -> 'dd/mm/yyyy – dd/mm/yyyy' (single date when equal or one missing) */
export function fmtDateRange(a, b) {
  if (!a && !b) return '—'
  if (!a) return fmtDate(b)
  if (!b || a === b) return fmtDate(a)
  return `${fmtDate(a)} – ${fmtDate(b)}`
}

/** 'Nguyễn Văn An' -> 'NA' (max 2 chars, uppercased) */
export function initials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Unwraps API payloads ({data: [...]}, paginated, or a bare array) into an array. */
export function normalizeList(payload) {
  const list = payload?.data ?? payload ?? []
  return Array.isArray(list) ? list : []
}

/** Pulls a human-readable message out of an axios error. */
export function extractError(err, fallback = 'Có lỗi xảy ra') {
  const data = err?.response?.data
  if (!data) return fallback
  if (data.message) return data.message
  const errors = data.errors
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors)[0]
    if (Array.isArray(first)) return first[0]
    if (first) return String(first)
  }
  return fallback
}

/** Number -> fixed 1-decimal string, e.g. 7.5 -> '7.5' */
export function fmtHours(n) {
  const num = Number(n)
  return Number.isFinite(num) ? num.toFixed(1) : '0.0'
}
