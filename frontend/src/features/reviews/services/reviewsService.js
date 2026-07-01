// ============================================================
// reviewsService — lớp "giả lập API" cho feature reviews.
// Mọi thao tác đọc/ghi dữ liệu đều đi qua đây, giống hệt cách 1 API client thật
// sẽ được gọi. Khi có backend thật, chỉ cần đổi nội dung các hàm export bên dưới
// sang gọi fetch()/axios — các hook và page phía trên KHÔNG cần sửa gì.
// ============================================================
import { products, productVariants, users, orders, initialReviews, currentUser } from '../data/mockData.js'

// State nội bộ mô phỏng database: reviews có thể bị ghi thêm khi submitReview,
// các bảng còn lại chỉ đọc trong phạm vi demo này.
let reviews = [...initialReviews]
let reviewIdCounter = 1000

export function getCurrentUser() {
  return currentUser
}

export function getProducts() {
  return products
}

export function getProductById(productId) {
  return products.find((p) => p.id === Number(productId)) || null
}

// Helper hiển thị: BE trả về mảng images, FE tự chọn ảnh đại diện (isPrimary)
export function getPrimaryImage(product) {
  return product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url
}

function getVariantById(variantId) {
  return productVariants.find((v) => v.id === variantId) || null
}

// OrderItem entity thật chỉ có variantId, KHÔNG có product/productId trực tiếp — hàm
// này mô phỏng đúng việc BE join variant -> product khi trả DTO cho FE.
function enrichOrderItem(item) {
  const variant = getVariantById(item.variantId)
  const product = variant ? getProductById(variant.productId) : null
  return { ...item, variant, product }
}

function enrichReview(review) {
  return { ...review, user: users.find((u) => u.id === review.userId) || null }
}

export function getOrders() {
  return orders.map((order) => ({ ...order, items: order.items.map(enrichOrderItem) }))
}

export function getOrderItem(orderId, orderItemId) {
  const order = getOrders().find((o) => o.id === Number(orderId)) || null
  const item = order?.items.find((i) => i.id === Number(orderItemId)) || null
  return { order, item }
}

export function getReviewsByProduct(productId) {
  return reviews
    .filter((r) => r.productId === Number(productId))
    .map(enrichReview)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getReviewSummary(productId) {
  const list = getReviewsByProduct(productId)
  const total = list.length
  const average = total > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / total : 0
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  list.forEach((r) => {
    breakdown[r.rating] = (breakdown[r.rating] || 0) + 1
  })
  return { productId: Number(productId), averageRating: average, totalReviews: total, breakdown }
}

export function getReviewByOrderItemId(orderItemId) {
  const found = reviews.find((r) => r.orderItemId === orderItemId)
  return found ? enrichReview(found) : null
}

// Mirror đúng ràng buộc unique(user_id, order_item_id) ở BE thật:
// 1 order item chỉ được review đúng 1 lần.
export function createReview({ orderItemId, productId, rating, comment }) {
  if (getReviewByOrderItemId(orderItemId)) {
    throw new Error('Bạn đã đánh giá sản phẩm này rồi.')
  }
  const newReview = {
    id: reviewIdCounter++,
    userId: currentUser.id,
    productId: Number(productId),
    orderItemId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  }
  reviews = [newReview, ...reviews]
  return enrichReview(newReview)
}
