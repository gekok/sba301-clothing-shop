import RatingStars from './RatingStars.jsx'

/**
 * ReviewSummary
 * props:
 * - summary: kết quả của reviewsService.getReviewSummary(productId)
 *   { averageRating, totalReviews, breakdown: {1..5: count} }
 *   (Số liệu được tính sẵn ở service, component chỉ render — giống hệt cách 1
 *   summary DTO từ BE thật sẽ trông như vậy.)
 */
export default function ReviewSummary({ summary }) {
  const average = summary?.averageRating ?? 0
  const total = summary?.totalReviews ?? 0
  const breakdown = summary?.breakdown ?? {}

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = breakdown[star] ?? 0
    const percent = total > 0 ? Math.round((count / total) * 100) : 0
    return { star, count, percent }
  })

  return (
    <div className="d-flex flex-wrap gap-4 align-items-start p-3 bg-white review-card mb-3">
      <div className="text-center" style={{ minWidth: 120 }}>
        <div className="display-5 fw-bold">{average.toFixed(1)}</div>
        <RatingStars value={Math.round(average)} readOnly size="md" />
        <div className="text-muted small mt-1">{total} đánh giá</div>
      </div>

      <div className="flex-grow-1" style={{ minWidth: 220 }}>
        {distribution.map(({ star, count, percent }) => (
          <div key={star} className="d-flex align-items-center gap-2 mb-1">
            <span style={{ width: 36 }}>{star} sao</span>
            <div className="summary-bar-bg flex-grow-1">
              <div className="summary-bar-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-muted small" style={{ width: 28, textAlign: 'right' }}>
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
