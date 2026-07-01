/**
 * FilterSortControls
 * props:
 * - starFilter: number | 'all'
 * - onStarFilterChange: function(value)
 * - sortOrder: 'newest' | 'oldest'
 * - onSortOrderChange: function(value)
 */
export default function FilterSortControls({
  starFilter,
  onStarFilterChange,
  sortOrder,
  onSortOrderChange,
}) {
  return (
    <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
      <select
        className="form-select form-select-sm w-auto"
        value={starFilter}
        onChange={(e) => onStarFilterChange(e.target.value)}
      >
        <option value="all">Tất cả số sao</option>
        {[5, 4, 3, 2, 1].map((s) => (
          <option key={s} value={s}>
            {s} sao
          </option>
        ))}
      </select>

      <select
        className="form-select form-select-sm w-auto"
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value)}
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
      </select>
    </div>
  )
}
