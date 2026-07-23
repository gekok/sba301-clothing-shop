// ============================================================
// reviewApi — gọi API Review THẬT từ backend (khác với reviewsService.js
// đang dùng mock data cho nhánh /test/reviews). File này dùng để nhúng
// đánh giá sản phẩm vào trang chi tiết sản phẩm thật (CustomerProductDetail).
//
// Endpoint backend (ReviewController): base path đã có /api/v1 ở axios baseURL
//   GET  /products/{productId}/reviews          -> Page<ReviewResponse>
//   GET  /products/{productId}/reviews/summary  -> ReviewSummaryResponse
//   POST /products/{productId}/reviews          -> ReviewResponse
//   PUT  /products/{productId}/reviews/{reviewId} -> ReviewResponse (sửa của chính mình)
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

// Sửa review của chính mình — chỉ gửi rating/comment (BE tự check ownership +
// edit-lock 1 lần/24h qua CurrentUserProvider, không cần/không gửi userId hay
// orderItemId ở đây).
export async function updateReview(productId, reviewId, { rating, comment }) {
  const res = await api.put(`/products/${productId}/reviews/${reviewId}`, {
    rating,
    comment,
  })
  return res.data
}

// Chuẩn hoá 1 ReviewResponse từ BE về đúng shape mà ReviewItem/ReviewList
// (vốn được xây theo mock enrichReview) đang mong đợi: { user: { fullName } }
//
// Phase 6b: bổ sung userId + updatedAt — ReviewList đã dùng review.userId để so sánh
// currentUserId từ trước (Phase 5) nhưng field này chưa từng được map ở đây (lỗ hổng từ
// Phase 5/6a, chỉ lộ ra khi 6b thật sự cần currentUserId để hiện nút "Sửa"). updatedAt cần
// thiết để FE tự tính "đã sửa 1 lần chưa" (so lệch với createdAt), cùng ngưỡng dung sai
// EDIT_DETECTION_TOLERANCE_SECONDS như BE (xem ReviewServiceImpl.updateReview) — chỉ để hiện
// UI hợp lý (ẩn/khoá nút, tooltip lý do), quyết định thật vẫn do BE validate lại khi submit.
export function normalizeReview(review) {
  return {
    id: review.id,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
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
