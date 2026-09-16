import { STATUS_LABELS } from '../../constants'

// Soft tinted pill palette (mirrors the theme colors in styles.css)
const STATUS_STYLES = {
  pending: 'bg-[#fff4e0] text-[#b7791f]',
  approved: 'bg-[#e0f6ec] text-[#1f7a4d]',
  rejected: 'bg-[#fdeaea] text-[#cf3a3a]',
  off: 'bg-primary-50 text-primary-500',
  remote: 'bg-[#f4f0ff] text-[#7c5cfc]',
  ot: 'bg-[#fff0e3] text-[#d9701a]',
  'role-admin': 'bg-[#fdeaea] text-[#cf3a3a]',
  'role-manager': 'bg-[#f4f0ff] text-[#7c5cfc]',
  'role-user': 'bg-[#eef1f7] text-[#5b6478]',
}

export default function StatusBadge({ status }) {
  const styles = STATUS_STYLES[status] || 'bg-[#eef1f7] text-[#5b6478]'
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${styles}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}
