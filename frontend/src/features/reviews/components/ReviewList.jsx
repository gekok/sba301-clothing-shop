import {useMemo, useState} from 'react'
import Pagination from 'react-bootstrap/Pagination'
import ReviewItem from './ReviewItem.jsx'
import FilterSortControls from './FilterSortControls.jsx'
import {buildPageRange, ELLIPSIS} from '../../../shared/utils/pagination.js'

export default function ReviewList({reviews, currentUserId, page = 0, totalPages = 0, onPageChange, onEditReview}) {
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

    const pageRange = useMemo(() => buildPageRange(page, totalPages), [page, totalPages])

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
                    <ReviewItem
                        key={review.id}
                        review={review}
                        currentUserId={currentUserId}
                        highlight={currentUserId != null && review.userId === currentUserId}
                        onEdit={onEditReview}
                    />
                ))
            )}

            {totalPages > 1 && typeof onPageChange === 'function' && (
                <Pagination className="justify-content-center mt-3">
                    <Pagination.Prev disabled={page === 0} onClick={() => onPageChange(page - 1)}/>
                    {pageRange.map((item, index) =>
                        item === ELLIPSIS ? (
                            <Pagination.Ellipsis key={`ellipsis-${index}`} disabled/>
                        ) : (
                            <Pagination.Item key={item} active={page === item} onClick={() => onPageChange(item)}>
                                {item + 1}
                            </Pagination.Item>
                        )
                    )}
                    <Pagination.Next disabled={page === totalPages - 1} onClick={() => onPageChange(page + 1)}/>
                </Pagination>
            )}
        </div>
    )
}
