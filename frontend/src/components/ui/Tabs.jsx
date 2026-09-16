export default function Tabs({ options, value, onChange }) {
  return (
    <div className="inline-flex gap-1 rounded-full bg-[#eef1f7] p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`cursor-pointer whitespace-nowrap rounded-full border-none px-4 py-[7px] text-[13px] font-semibold transition-[background,color,box-shadow] duration-150 ${
            opt.value === value
              ? 'bg-white text-primary-500 shadow-[0_1px_3px_rgba(16,24,40,0.06)]'
              : 'bg-transparent text-[#7a8499] hover:text-[#1a2233]'
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
