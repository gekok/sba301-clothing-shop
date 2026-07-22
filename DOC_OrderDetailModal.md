# GIẢI THÍCH CHI TIẾT FILE COMPONENT: OrderDetailModal.jsx

- **Đường dẫn tương đối:** `frontend/src/features/orders/components/OrderDetailModal.jsx`
- **Chức năng:** Modal giao diện hiển thị chi tiết một đơn hàng (Danh sách món, Đơn giá, Phí vận chuyển, Tổng thanh toán và Trạng thái đơn).

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```jsx
import { Modal, Button, Badge, Row, Col, Table } from 'react-bootstrap';
import { formatVND } from '../../../shared/utils/format.js';

export default function OrderDetailModal({ show, onHide, order }) {
  if (!order) return null; // Nếu chưa chọn đơn hàng -> Không render gì cả

  // Hàm sinh Badge màu sắc trực quan theo Trạng thái Đơn hàng
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <Badge bg="warning" text="dark">Chờ xử lý</Badge>;
      case 'CONFIRMED': return <Badge bg="primary">Đã xác nhận</Badge>;
      case 'SHIPPING': return <Badge bg="info" text="dark">Đang giao hàng</Badge>;
      case 'COMPLETED': return <Badge bg="success">Đã hoàn thành</Badge>;
      case 'CANCELLED': return <Badge bg="danger">Đã hủy</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-uppercase">
          Chi tiết đơn hàng #{order.orderCode}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Render Bảng danh sách các sản phẩm trong đơn */}
        <Table hover responsive className="align-middle">
          <thead className="table-dark text-uppercase small">
            <tr>
              <th>Sản phẩm</th>
              <th>Phân loại</th>
              <th className="text-center">Đơn giá</th>
              <th className="text-center">Số lượng</th>
              <th className="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td className="fw-bold">{item.productName}</td>
                <td className="text-muted small">{item.variantInfo}</td>
                <td className="text-center">{formatVND(item.unitPrice)}</td>
                <td className="text-center fw-bold">{item.quantity}</td>
                <td className="text-end fw-bold text-danger">
                  {formatVND(item.subtotal || item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Tổng quan hóa đơn */}
        <div className="p-3 bg-light border border-dark border-2">
          <div className="d-flex justify-content-between mb-2">
            <span>Tạm tính:</span>
            <span className="fw-bold">{formatVND(order.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Phí vận chuyển:</span>
            <span className="fw-bold">{formatVND(order.shippingFee || 0)}</span>
          </div>
          <div className="d-flex justify-content-between fs-5 fw-bold text-danger border-top pt-2">
            <span>Tổng tiền:</span>
            <span>{formatVND(order.totalAmount)}</span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={onHide}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}
