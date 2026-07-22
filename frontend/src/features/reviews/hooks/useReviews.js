// ============================================================
// hooks — lớp binding React cho reviewsService.
// Thay cho Context trước đây: mỗi page tự gọi hook để lấy dữ liệu mình cần,
// service phía dưới đóng vai trò "nguồn sự thật" dùng chung giữa các page.
// ============================================================
import { useEffect, useState } from 'react'
import {
  getProductById,
  getReviewsByProduct,
  getReviewSummary,
  getOrders,
  getOrderItem,
  getReviewByOrderItemId,
  createReview,
  getCurrentUser,
} from '../services/reviewsService.js'

// Dùng cho ProductReviewsPage: load product + danh sách review + summary theo productId
export function useProductReviews(productId) {
  const [state, setState] = useState(() => load(productId))

  useEffect(() => {
    setState(load(productId))
  }, [productId])

  function load(id) {
    const product = getProductById(id)
    return {
      product,
      reviews: product ? getReviewsByProduct(id) : [],
      summary: product ? getReviewSummary(id) : null,
    }
  }

  return state
}

// Dùng cho ReviewTestPage: danh sách đơn hàng kèm hàm tra review theo orderItem
export function useOrders() {
  const [orders, setOrders] = useState(() => getOrders())

  function reload() {
    setOrders(getOrders())
  }

  return { orders, getReviewByOrderItemId, reload }
}

// Dùng cho ReviewFormPage: lấy order/item theo params trên URL + hàm submit review
export function useOrderItemReview(orderId, orderItemId) {
  const { order, item } = getOrderItem(orderId, orderItemId)
  const existingReview = item ? getReviewByOrderItemId(item.id) : null
  const currentUser = getCurrentUser()

  function submit({ rating, comment }) {
    return createReview({ orderItemId: item.id, productId: item.product.id, rating, comment })
  }

  return { order, item, existingReview, currentUser, submit }
}
