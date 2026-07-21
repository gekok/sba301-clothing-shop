import { Link } from 'react-router-dom';
import { getPrimaryImage } from '../services/reviewsService.js';
import ReviewItem from './ReviewItem.jsx';
import { formatVND } from '../../../shared/utils/format.js'

// Mirror đúng ELIGIBLE_STATUSES bên BE (ReviewServiceImpl.java): chỉ đơn hàng đã
// DELIVERED/COMPLETED mới được phép review. FE cũng phải tự chặn nút "Đánh giá"
// thay vì chỉ dựa vào BE trả lỗi, để không hiện nút bấm rồi lại báo lỗi.
const REVIEW_ELIGIBLE_STATUSES = ['DELIVERED', 'COMPLETED']

/**
 * OrderItemRow
 * props:
 * - item: OrderItem đã enrich { id, orderId, variantId, productName, variantInfo,
 *     unitPrice, quantity, subtotal, variant, product }
 * - orderStatus: trạng thái của đơn hàng chứa item này (order.status)
 * - myReview: review của currentUser cho item này, hoặc null nếu chưa đánh giá
 *   (được truyền từ page cha lấy qua hook useOrders(), thay cho việc đọc Context)
 */
export default function OrderItemRow({ item, orderStatus, myReview }) {
  const imageUrl = item.product ? getPrimaryImage(item.product) : null;
  const productLink = item.product ? `/test/reviews/products/${item.product.id}` : null;
  const canReview = REVIEW_ELIGIBLE_STATUSES.includes(orderStatus);

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
          {item.variantInfo} · SL: {item.quantity} · {formatVND(item.unitPrice)} đ
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
        ) : item.product && canReview ? (
          <Link
            to={`/test/reviews/orders/${item.orderId}/items/${item.id}/review`}
            className="btn btn-sm btn-outline-primary mt-2"
          >
            Đánh giá
          </Link>
        ) : item.product ? (
          <span className="text-muted small d-block mt-2">
            Đơn hàng chưa được giao hoặc chưa hoàn tất, chưa thể đánh giá.
          </span>
        ) : (
          <span className="text-muted small d-block mt-2">Sản phẩm không còn tồn tại để đánh giá.</span>
        )}
      </div>
    </div>
  )
}
