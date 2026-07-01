import { Link } from 'react-router-dom'
import { getPrimaryImage } from '../services/reviewsService.js'
import ReviewItem from './ReviewItem.jsx'

/**
 * OrderItemRow
 * props:
 * - item: OrderItem đã enrich { id, orderId, variantId, productName, variantInfo,
 *     unitPrice, quantity, subtotal, variant, product }
 * - myReview: review của currentUser cho item này, hoặc null nếu chưa đánh giá
 *   (được truyền từ page cha lấy qua hook useOrders(), thay cho việc đọc Context)
 */
export default function OrderItemRow({ item, myReview }) {
  const imageUrl = item.product ? getPrimaryImage(item.product) : null
  const productLink = item.product ? `/test/reviews/products/${item.product.id}` : null

  return (
    <div className="d-flex flex-wrap gap-3 align-items-start py-3 border-bottom">
      {productLink && (
        <Link to={productLink}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={item.productName}
              width={64}
              height={64}
              className="rounded"
              style={{ objectFit: 'cover' }}
            />
          )}
        </Link>
      )}

      <div className="flex-grow-1" style={{ minWidth: 200 }}>
        {productLink ? (
          <Link to={productLink} className="fw-semibold text-decoration-none">
            {item.productName}
          </Link>
        ) : (
          <span className="fw-semibold">{item.productName}</span>
        )}
        <div className="text-muted small">
          {item.variantInfo} · SL: {item.quantity} · {item.unitPrice.toLocaleString('vi-VN')} đ
        </div>

        {myReview ? (
          <div className="mt-2">
            <ReviewItem review={myReview} highlight />
            {productLink && (
              <Link to={productLink} className="small">
                Xem trên trang sản phẩm →
              </Link>
            )}
          </div>
        ) : item.product ? (
          <Link
            to={`/test/reviews/orders/${item.orderId}/items/${item.id}/review`}
            className="btn btn-sm btn-outline-primary mt-2"
          >
            Đánh giá
          </Link>
        ) : (
          <span className="text-muted small d-block mt-2">Sản phẩm không còn tồn tại để đánh giá.</span>
        )}
      </div>
    </div>
  )
}
