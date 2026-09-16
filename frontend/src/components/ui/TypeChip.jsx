import { REQUEST_TYPE_LABELS } from '../../constants'

// Soft tinted pill palette (mirrors the theme colors in styles.css)
const TYPE_STYLES = {
  off: 'bg-primary-50 text-primary-500',
  remote: 'bg-[#f4f0ff] text-[#7c5cfc]',
  ot: 'bg-[#fff0e3] text-[#d9701a]',
}

export default function TypeChip({ type }) {
  const styles = TYPE_STYLES[type] || 'bg-[#eef1f7] text-[#5b6478]'
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${styles}`}
    >
      {REQUEST_TYPE_LABELS[type] || type}
    </span>
  )
}
