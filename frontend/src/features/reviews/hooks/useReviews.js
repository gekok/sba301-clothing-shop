// ============================================================
// hooks — lớp binding React cho reviewsService.
// Thay cho Context trước đây: mỗi page tự gọi hook để lấy dữ liệu mình cần,
// service phía dưới đóng vai trò "nguồn sự thật" dùng chung giữa các page.
// ============================================================
import { useEffect, useState } from 'react'
import { fetchReviewSummary, fetchReviews, normalizeReview, normalizeSummary } from '../services/reviewApi.js'


// Dùng để nhúng review THẬT (gọi backend qua reviewApi.js) vào trang chi tiết
// sản phẩm thật (CustomerProductDetail), khác với useProductReviews ở trên
// (vốn đọc từ mock data cho nhánh /test/reviews).
export function useProductReviewsApi(productId) {
  const [summary, setSummary] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchReviewSummary(productId), fetchReviews(productId)])
      .then(([summaryData, reviewsPage]) => {
        if (cancelled) return
        setSummary(normalizeSummary(summaryData))
        setReviews((reviewsPage?.content ?? []).map(normalizeReview))
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
  }, [productId])

  return { summary, reviews, loading, error }
}
