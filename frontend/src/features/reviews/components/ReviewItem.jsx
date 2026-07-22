import RatingStars from './RatingStars.jsx'

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?'
}

/**
 * ReviewItem
 * props:
 * - review: { id, userId, user: {fullName}, rating, comment, createdAt }
 * - highlight: boolean -> đánh dấu "review của bạn"
 */
export default function ReviewItem({ review, highlight = false }) {
  const displayName = review.user?.fullName || 'Người dùng'
  return (
    <div className={`review-card p-3 mb-3 ${highlight ? 'border-primary bg-primary-subtle' : 'bg-white'}`}>
      <div className="d-flex gap-3">
        <div className="avatar-circle">{getInitial(displayName)}</div>
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between flex-wrap">
            <span className="fw-semibold">
              {displayName} {highlight && <span className="badge bg-primary ms-1">Bạn</span>}
            </span>
            <small className="text-muted">{formatDate(review.createdAt)}</small>
          </div>
          <RatingStars value={review.rating} readOnly size="sm" />
          <p className="mb-0 mt-2">{review.comment}</p>
        </div>
      </div>
    </div>
  )
}
