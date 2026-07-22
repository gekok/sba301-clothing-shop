import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getProducts, getPrimaryImage } from '../services/reviewsService.js'
import { useOrders } from '../hooks/useReviews.js'
import OrderCard from '../components/OrderCard.jsx'

export default function ReviewTestPage() {
  const products = getProducts()
  const { orders, getReviewByOrderItemId } = useOrders()
  const location = useLocation()

  // ReviewFormPage điều hướng về đây kèm { state: { reviewSubmitted: true } } sau khi
  // gửi thành công — chỉ hiện 1 lần, không phụ thuộc reload trang.
  const [showSuccess, setShowSuccess] = useState(Boolean(location.state?.reviewSubmitted))

  return (
    <div className="container" style={{ maxWidth: 860 }}>
      <h3 className="mb-1">Test: Reviews feature</h3>
      <p className="text-muted mb-4">
        Trang demo độc lập cho nhánh <code>feature/reviews</code> — dữ liệu sản phẩm/đơn hàng đều
        là mock, chưa nối với các feature khác của dự án.
      </p>

      {showSuccess && (
        <div className="alert alert-success alert-dismissible" role="alert">
          Cảm ơn bạn đã đánh giá sản phẩm!
          <button type="button" className="btn-close" onClick={() => setShowSuccess(false)} />
        </div>
      )}

      <h5 className="mb-3">Sản phẩm</h5>
      <div className="row g-3 mb-5">
        {products.map((p) => (
          <div className="col-6 col-md-3" key={p.id}>
            <Link to={`/test/reviews/products/${p.id}`} className="text-decoration-none text-dark">
              <div className="card h-100">
                <img
                  src={getPrimaryImage(p)}
                  className="card-img-top"
                  alt={p.name}
                  style={{ objectFit: 'cover', height: 140 }}
                />
                <div className="card-body p-2">
                  <div className="fw-semibold small">{p.name}</div>
                  <div className="text-muted small">{p.basePrice.toLocaleString('vi-VN')} đ</div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <h5 className="mb-3">Đơn hàng của bạn (demo)</h5>
      {orders.length === 0 ? (
        <p className="text-muted">Chưa có đơn hàng nào.</p>
      ) : (
        orders.map((order) => (
          <OrderCard key={order.id} order={order} getReviewByOrderItemId={getReviewByOrderItemId} />
        ))
      )}
    </div>
  )
}
