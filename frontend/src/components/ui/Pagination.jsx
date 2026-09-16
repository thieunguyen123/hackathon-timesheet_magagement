// Secondary small-button style (white bg, bordered, muted hover)
const buttonClass =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e6e9f2] bg-white px-3 py-[5px] text-[13px] font-semibold text-[#1a2233] transition-[background,border-color,color,box-shadow] duration-150 enabled:hover:border-[#d5dbe8] enabled:hover:bg-[#f6f8fc] disabled:cursor-not-allowed disabled:opacity-60'

export default function Pagination({ page, lastPage, onChange }) {
  if (!lastPage || lastPage <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={buttonClass}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹ Trước
      </button>
      <span className="text-[#7a8499]">
        {page}/{lastPage}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={page >= lastPage}
        onClick={() => onChange(page + 1)}
      >
        Sau ›
      </button>
    </div>
  )
}
