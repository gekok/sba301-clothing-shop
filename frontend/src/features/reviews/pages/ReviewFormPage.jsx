import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useOrderItemReview } from '../hooks/useReviews.js'
import ReviewForm from '../components/ReviewForm.jsx'

export default function ReviewFormPage() {
  const { orderId, orderItemId } = useParams()
  const navigate = useNavigate()
  const { order, item, existingReview, submit } = useOrderItemReview(orderId, orderItemId)
  const [error, setError] = useState('')

  if (!order || !item) {
    return (
      <div className="container" style={{ maxWidth: 600 }}>
        <p className="text-danger">Không tìm thấy sản phẩm trong đơn hàng này.</p>
        <Link to="/test/reviews" className="btn btn-sm btn-outline-secondary">
          ← Về trang test reviews
        </Link>
      </div>
    )
  }

  // Chặn review trùng ngay ở route: nếu order item này đã có review (vd gõ thẳng URL,
  // bấm Back sau khi vừa gửi) thì tự điều hướng về, không cho gửi lần 2 — khớp đúng
  // ràng buộc unique(user_id, order_item_id) ở BE thật.
  if (existingReview) {
    return <Navigate to="/test/reviews" replace />
  }

  if (!item.product) {
    return (
      <div className="container" style={{ maxWidth: 600 }}>
        <p className="text-danger">Sản phẩm trong đơn hàng này hiện không còn tồn tại.</p>
        <Link to="/test/reviews" className="btn btn-sm btn-outline-secondary">
          ← Về trang test reviews
        </Link>
      </div>
    )
  }

  function handleSubmit({ rating, comment }) {
    try {
      submit({ rating, comment })
      navigate('/test/reviews', { state: { reviewSubmitted: true } })
    } catch (err) {
      // service ném lỗi khi phát hiện review trùng (double-submit do bấm nhanh 2 lần...)
      setError(err.message)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <Link to="/test/reviews" className="text-decoration-none small d-inline-block mb-3">
        ← Về trang test reviews
      </Link>
      <h4 className="mb-4">Viết đánh giá sản phẩm</h4>
      <div className="bg-white p-4 review-card">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <ReviewForm product={item.product} onSubmit={handleSubmit} onCancel={() => navigate('/test/reviews')} />
      </div>
    </div>
  )
}
