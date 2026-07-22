// ============================================================
// reviewApi — gọi API Review THẬT từ backend (khác với reviewsService.js
// đang dùng mock data cho nhánh /test/reviews). File này dùng để nhúng
// đánh giá sản phẩm vào trang chi tiết sản phẩm thật (CustomerProductDetail).
//
// Endpoint backend (ReviewController): base path đã có /api/v1 ở axios baseURL
//   GET  /products/{productId}/reviews          -> Page<ReviewResponse>
//   GET  /products/{productId}/reviews/summary  -> ReviewSummaryResponse
//   POST /products/{productId}/reviews          -> ReviewResponse
// ============================================================
import api from '../../../shared/services/axios.js'

export async function fetchReviewSummary(productId) {
  const res = await api.get(`/products/${productId}/reviews/summary`)
  return res.data
}

export async function fetchReviews(productId, { page = 0, size = 10 } = {}) {
  const res = await api.get(`/products/${productId}/reviews`, {
    params: { page, size },
  })
  return res.data
}

// userId KHÔNG gửi lên nữa — BE tự lấy người đang đăng nhập từ SecurityContext
// (tránh 1 user gửi userId của người khác để mạo danh đánh giá).
export async function submitReview(productId, { orderItemId, rating, comment }) {
  const res = await api.post(`/products/${productId}/reviews`, {
    orderItemId,
    rating,
    comment,
  })
  return res.data
}

// Chuẩn hoá 1 ReviewResponse từ BE về đúng shape mà ReviewItem/ReviewList
// (vốn được xây theo mock enrichReview) đang mong đợi: { user: { fullName } }
export function normalizeReview(review) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    orderItemId: review.orderItemId,
    user: { fullName: review.authorName },
  }
}

// Chuẩn hoá ReviewSummaryResponse -> shape ReviewSummary component đang dùng
export function normalizeSummary(summary) {
  return {
    averageRating: summary?.averageRating ?? 0,
    totalReviews: summary?.totalReviews ?? 0,
    breakdown: summary?.breakdown ?? {},
  }
}
