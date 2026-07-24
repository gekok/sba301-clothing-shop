import { Modal, Button, Badge, Row, Col, Table } from 'react-bootstrap';
import { formatVND } from '../../../shared/utils/format.js';
import { BoxSeam, CreditCard, GeoAlt, FileText } from 'react-bootstrap-icons';
import { ORDER_STATUS_LABEL } from '../../../shared/utils/orderStatus.js';

export default function OrderDetailModal({ show, onHide, order }) {
  if (!order) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning" text="dark" className="rounded-0 text-uppercase px-3 py-2">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge bg="primary" className="rounded-0 text-uppercase px-3 py-2">Đã xác nhận</Badge>;
      case 'SHIPPING':
        return <Badge bg="info" text="dark" className="rounded-0 text-uppercase px-3 py-2">Đang giao hàng</Badge>;
      case 'DELIVERED':
        return <Badge bg="success" className="rounded-0 text-uppercase px-3 py-2">{ORDER_STATUS_LABEL.DELIVERED}</Badge>;
      case 'COMPLETED':
        return <Badge bg="success" className="rounded-0 text-uppercase px-3 py-2">{ORDER_STATUS_LABEL.COMPLETED}</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger" className="rounded-0 text-uppercase px-3 py-2">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary" className="rounded-0 text-uppercase px-3 py-2">{status}</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'PAID':
        return <Badge bg="success" className="rounded-0 text-uppercase px-2 py-1">Đã thanh toán</Badge>;
      case 'UNPAID':
        return <Badge bg="danger" className="rounded-0 text-uppercase px-2 py-1">Chưa thanh toán</Badge>;
      default:
        return <Badge bg="secondary" className="rounded-0 text-uppercase px-2 py-1">{paymentStatus}</Badge>;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom border-dark border-2 bg-light">
        <Modal.Title className="fw-bold text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Chi tiết đơn hàng #{order.orderCode}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Header Summary */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 mb-4 bg-light border border-dark border-2">
          <div>
            <span className="text-muted small d-block">Trạng thái đơn hàng:</span>
            <div className="mt-1">{getStatusBadge(order.status)}</div>
          </div>
          <div>
            <span className="text-muted small d-block">Trạng thái thanh toán:</span>
            <div className="mt-1">{getPaymentBadge(order.paymentStatus)}</div>
          </div>
          <div>
            <span className="text-muted small d-block">Phương thức thanh toán:</span>
            <span className="fw-bold text-uppercase small">{order.paymentMethod || 'VNPAY / COD'}</span>
          </div>
        </div>

        {/* Order Items Table */}
        <h5 className="fw-bold text-uppercase mb-3 d-flex align-items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <BoxSeam /> Danh sách sản phẩm
        </h5>
        <div className="table-responsive mb-4 border border-dark border-2">
          <Table hover className="align-middle mb-0">
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
                  <td className="text-muted small">{item.variantInfo || 'N/A'}</td>
                  <td className="text-center">{formatVND(item.unitPrice)}</td>
                  <td className="text-center fw-bold">{item.quantity}</td>
                  <td className="text-end fw-bold text-danger">{formatVND(item.subtotal || item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Pricing Summary */}
        <Row className="g-4 mb-3">
          <Col md={6}>
            {order.note && (
              <div className="p-3 border border-dark border-2 bg-light h-100">
                <span className="fw-bold text-uppercase small d-flex align-items-center gap-2 mb-1">
                  <FileText /> Ghi chú từ khách hàng:
                </span>
                <p className="mb-0 text-muted small">{order.note}</p>
              </div>
            )}
          </Col>
          <Col md={6}>
            <div className="p-3 border border-dark border-2 bg-light">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span className="fw-bold">{formatVND(order.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="fw-bold">{formatVND(order.shippingFee || 0)}</span>
              </div>
              <hr className="my-2 border-dark" />
              <div className="d-flex justify-content-between fs-5 fw-bold text-danger">
                <span>Tổng cộng:</span>
                <span>{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="border-top border-dark border-2">
        <Button variant="dark" onClick={onHide} className="rounded-0 text-uppercase fw-bold px-4">
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
