import {useEffect, useState} from 'react'
import {fetchReviewSummary, fetchReviews, normalizeReview, normalizeSummary} from '../services/reviewApi.js'

export function useProductReviewsApi(productId) {
    const [summary, setSummary] = useState(null)
    const [reviews, setReviews] = useState([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        setPage(0)
    }, [productId])

    const [reloadToken, setReloadToken] = useState(0)

    useEffect(() => {
        if (!productId) return

        let cancelled = false
        setLoading(true)
        setError('')

        Promise.all([fetchReviewSummary(productId), fetchReviews(productId, {page})])
            .then(([summaryData, reviewsPage]) => {
                if (cancelled) return
                setSummary(normalizeSummary(summaryData))
                setReviews((reviewsPage?.content ?? []).map(normalizeReview))
                setTotalPages(reviewsPage?.totalPages ?? 0)
            })
            .catch((err) => {
                console.error('Lỗi khi tải đánh giá sản phẩm:', err)
                if (!cancelled) setError('Không tải được đánh giá sản phẩm.')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [productId, page, reloadToken])

    function goToPage(nextPage) {
        setPage(nextPage)
    }

    function refetch() {
        setReloadToken((t) => t + 1)
    }

    return {summary, reviews, loading, error, page, totalPages, goToPage, refetch}
}