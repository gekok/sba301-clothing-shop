import OrderItemRow from './OrderItemRow.jsx'

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

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
          <span className="badge bg-success ms-2">{order.status}</span>
          <span className="badge bg-secondary ms-1">{order.paymentStatus}</span>
        </span>
        <span className="text-muted small">Ngày đặt: {formatDate(order.createdAt)}</span>
      </div>

      {order.items.map((item) => (
        <OrderItemRow key={item.id} item={item} myReview={getReviewByOrderItemId(item.id)} />
      ))}
    </div>
  )
}
