// Calendar helpers working on LOCAL dates (no UTC conversion anywhere).

const pad2 = (n) => String(n).padStart(2, '0')

/** Date -> 'YYYY-MM-DD' using local components (no UTC shift). */
export function toKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function isToday(date) {
  return toKey(date) === toKey(new Date())
}

/** Accepts Date | 'YYYY-MM-DD[...]' and returns a local-midnight Date. */
function toLocalDate(d) {
  if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const parsed = new Date(d)
  return Number.isNaN(parsed.getTime())
    ? parsed
    : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

/**
 * 'YYYY-MM' -> 42 cells (6 weeks, Monday start) covering the whole month.
 * Each cell: { date: Date, inMonth: boolean }.
 */
export function monthCells(monthStr) {
  const [year, month] = String(monthStr).split('-').map(Number)
  const first = new Date(year, month - 1, 1)
  // JS getDay(): 0=Sun..6=Sat -> offset from Monday
  const offset = (first.getDay() + 6) % 7
  const start = new Date(year, month - 1, 1 - offset)
  const cells = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    cells.push({ date, inMonth: date.getMonth() === month - 1 })
  }
  return cells
}

/** Inclusive local-day range: eachDay('2024-03-01', '2024-03-03') -> 3 Dates. */
export function eachDay(start, end) {
  const s = toLocalDate(start)
  const e = toLocalDate(end)
  const days = []
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) return days
  for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d))
  }
  return days
}

const TYPE_PRIORITY = { off: 3, remote: 2, ot: 1 }

/**
 * Requests [{type, start_date, end_date, ...}] -> Map<'YYYY-MM-DD', request>
 * covering every day in each request's range. When several requests cover the
 * same day, precedence is off > remote > ot (earlier request wins ties).
 */
export function expandRequestsToDateMap(requests) {
  const map = new Map()
  for (const req of requests ?? []) {
    if (!req) continue
    const type = req.type ?? req.request_type
    const priority = TYPE_PRIORITY[type] ?? 0
    for (const day of eachDay(req.start_date, req.end_date)) {
      const key = toKey(day)
      const existing = map.get(key)
      if (!existing || priority > (TYPE_PRIORITY[existing.type] ?? 0)) {
        map.set(key, { ...req, type })
      }
    }
  }
  return map
}
