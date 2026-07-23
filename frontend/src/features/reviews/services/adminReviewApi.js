// Tầng gọi API cho màn Admin quản lý review.
// Endpoint backend (AdminReviewController, base path đã có /api ở axios baseURL):
//   GET   /admin/reviews                 -> Page<AdminReviewResponse> (mọi review, kể cả đã ẩn)
//   PATCH /admin/reviews/{id}/visibility -> AdminReviewResponse (ẩn/khôi phục)
import api from '../../../shared/services/axios.js'

export async function searchReviews({ productId, rating, isVisible, keyword, page = 0, size = 10 } = {}) {
  const res = await api.get('/admin/reviews', {
    params: { productId, rating, isVisible, keyword, page, size },
  })
  return res.data
}

// Phase 7b: ẩn hoặc khôi phục 1 review. isVisible phải gửi rõ true/false (khớp @NotNull ở BE,
// không suy luận "đảo ngược trạng thái hiện tại" ở FE để tránh lệch dữ liệu giữa nhiều tab admin).
export async function updateVisibility(id, isVisible) {
  const res = await api.patch(`/admin/reviews/${id}/visibility`, { isVisible })
  return res.data
}
