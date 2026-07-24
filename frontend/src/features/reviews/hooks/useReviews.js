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
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Đổi sản phẩm -> quay lại trang 0 (tránh giữ page cũ của sản phẩm trước
  // rồi gọi API với page vượt quá totalPages của sản phẩm mới).
  useEffect(() => {
    setPage(0)
  }, [productId])

  // reloadToken chỉ dùng để ép effect bên dưới chạy lại (khi refetch() được gọi
  // sau update) mà KHÔNG đổi productId/page — tránh phải nhân bản logic fetch.
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([fetchReviewSummary(productId), fetchReviews(productId, { page })])
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

  // Gọi lại API cho đúng (productId, page) hiện tại — dùng sau khi sửa review
  // thành công, để không phải reset về trang 0 hay tự ghép state thủ công.
  function refetch() {
    setReloadToken((t) => t + 1)
  }

  return { summary, reviews, loading, error, page, totalPages, goToPage, refetch }
}
