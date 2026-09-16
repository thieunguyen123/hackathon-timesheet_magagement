import { initials } from '../../utils/format'

export default function Avatar({ name, sm }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-50 font-bold uppercase text-primary-500 ${
        sm ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
      }`}
    >
      {initials(name)}
    </span>
  )
}
