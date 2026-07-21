import OrderItemRow from './OrderItemRow.jsx';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';
import { formatDateTime } from '../../../shared/utils/format.js';

/**
 * OrderCard
 * props:
 * - order: Order { id, orderCode, status, paymentStatus, createdAt, items }
 * - getReviewByOrderItemId: function(orderItemId) -> review | null, lấy từ hook useOrders()
 */
export default function OrderCard({ order, getReviewByOrderItemId }) {
  return (
    <div className="order-card bg-white p-3 mb-4 shadow-sm">
      <div className="d-flex justify-content-between flex-wrap mb-2">
        <span className="fw-semibold">
          Đơn hàng #{order.orderCode}
          <span className="ms-2"><StatusBadge status={order.status} type="order" /></span>
          <span className="ms-1"><StatusBadge status={order.paymentStatus} type="payment" /></span>
        </span>
        <span className="text-muted small">Ngày đặt: {formatDateTime(order.createdAt)}</span>
      </div>

      {order.items.map((item) => (
        <OrderItemRow
          key={item.id}
          item={item}
          orderStatus={order.status}
          myReview={getReviewByOrderItemId(item.id)}
        />
      ))}
    </div>
  )
}
