import { useMemo, useState } from 'react'
import ReviewItem from './ReviewItem.jsx'
import FilterSortControls from './FilterSortControls.jsx'

/**
 * ReviewList
 * props:
 * - reviews: array review của 1 sản phẩm
 * - currentUserId: number -> để highlight review của chính mình
 */
export default function ReviewList({ reviews, currentUserId }) {
  const [starFilter, setStarFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  const visibleReviews = useMemo(() => {
    let list = [...reviews]

    if (starFilter !== 'all') {
      list = list.filter((r) => r.rating === Number(starFilter))
    }

    list.sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt)
      return sortOrder === 'newest' ? -diff : diff
    })

    return list
  }, [reviews, starFilter, sortOrder])

  return (
    <div>
      <FilterSortControls
        starFilter={starFilter}
        onStarFilterChange={setStarFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {visibleReviews.length === 0 ? (
        <p className="text-muted">Chưa có đánh giá phù hợp.</p>
      ) : (
        visibleReviews.map((review) => (
          <ReviewItem key={review.id} review={review} highlight={review.userId === currentUserId} />
        ))
      )}
    </div>
  )
}
