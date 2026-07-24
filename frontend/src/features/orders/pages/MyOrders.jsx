import { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, Nav, Spinner, Alert } from 'react-bootstrap';
import { BagCheck, Eye, BoxSeam, ClockHistory, ArrowRight, StarFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import api from '../../../shared/services/axios.js';
import { formatVND } from '../../../shared/utils/format.js';
import { ORDER_STATUS_LABEL } from '../../../shared/utils/orderStatus.js';
import OrderDetailModal from '../components/OrderDetailModal.jsx';
import ReviewFormModal from '../../reviews/components/ReviewFormModal.jsx';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [reviewItem, setReviewItem] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/orders/me');
      setOrders(res.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleOpenReview = (item) => {
    setReviewItem(item);
    setShowReviewModal(true);
  };

  // Đánh dấu reviewed=true ngay trên state cục bộ sau khi gửi thành công, khỏi
  // phải fetch lại /orders/me chỉ để đổi 1 field.
  const handleReviewSubmitted = (orderItemId) => {
    setOrders((prev) =>
      prev.map((order) => ({
        ...order,
        items: order.items?.map((item) =>
          item.orderItemId === orderItemId ? { ...item, reviewed: true } : item,
        ),
      })),
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge bg="warning" text="dark" className="rounded-0 text-uppercase px-3 py-2">Chờ xử lý</Badge>;
      case 'CONFIRMED':
        return <Badge bg="primary" className="rounded-0 text-uppercase px-3 py-2">Đã xác nhận</Badge>;
      case 'SHIPPING':
        return <Badge bg="info" text="dark" className="rounded-0 text-uppercase px-3 py-2">Đang giao</Badge>;
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

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center py-5 my-5" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="dark" size="lg" className="mb-3" />
        <p className="text-muted fw-bold text-uppercase" style={{ letterSpacing: '0.1em' }}>Đang tải lịch sử đơn hàng...</p>
      </Container>
    );
  }

  return (
    <div className="bg-light py-5" style={{ minHeight: '80vh' }}>
      <Container>
        {/* Title Banner */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-2 border-bottom border-dark border-3">
          <div>
            <h1 className="fw-bold text-uppercase mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.02em' }}>
              <ClockHistory className="me-2 mb-1" /> Đơn hàng của tôi
            </h1>
            <p className="text-muted mb-0">Quản lý và theo dõi danh sách các đơn hàng bạn đã mua</p>
          </div>
          <Button as={Link} to="/products" variant="outline-dark" className="rounded-0 fw-bold text-uppercase border-2">
            Tiếp tục mua sắm <ArrowRight className="ms-1" />
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="rounded-0 border-2 mb-4">
            {error}
          </Alert>
        )}

        {/* Status Filter Nav Tabs */}
        <Nav
          variant="pills"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 d-flex flex-wrap gap-2"
        >
          {[
            { key: 'ALL', label: 'Tất cả đơn' },
            { key: 'PENDING', label: 'Chờ xử lý' },
            { key: 'CONFIRMED', label: 'Đã xác nhận' },
            { key: 'SHIPPING', label: 'Đang giao' },
            { key: 'COMPLETED', label: 'Hoàn thành' },
            { key: 'CANCELLED', label: 'Đã hủy' }
          ].map(tab => (
            <Nav.Item key={tab.key}>
              <Nav.Link
                eventKey={tab.key}
                className={`rounded-0 fw-bold text-uppercase px-3 py-2 border border-dark border-2 ${
                  activeTab === tab.key ? 'bg-dark text-white' : 'bg-white text-dark'
                }`}
              >
                {tab.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="checkoutx-panel p-5 border border-dark border-3 bg-white text-center my-4" style={{ boxShadow: '8px 8px 0px #000' }}>
            <BoxSeam className="fs-1 text-muted mb-3" />
            <h4 className="fw-bold text-uppercase mb-2">Chưa có đơn hàng nào</h4>
            <p className="text-muted mb-4">Bạn chưa có đơn hàng nào thuộc trạng thái này.</p>
            <Button as={Link} to="/products" variant="dark" className="rounded-0 text-uppercase fw-bold px-4 py-2">
              Khám phá sản phẩm ngay
            </Button>
          </div>
        ) : (
          /* Order Cards List */
          <Row className="g-4">
            {filteredOrders.map(order => (
              <Col key={order.orderCode} xs={12}>
                <div
                  className="checkoutx-panel p-4 border border-dark border-3 bg-white"
                  style={{ boxShadow: '6px 6px 0px #000' }}
                >
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 mb-3 border-bottom border-dark border-2">
                    <div>
                      <span className="text-muted small d-block">Mã đơn hàng:</span>
                      <span className="fw-bold fs-5 text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        #{order.orderCode}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      {getStatusBadge(order.status)}
                      <span className="fw-bold fs-5 text-danger">
                        {formatVND(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Order Preview Items */}
                  <div className="mb-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center justify-content-between py-2 border-bottom border-light">
                        <div>
                          <span className="fw-bold d-block">{item.productName}</span>
                          <span className="text-muted small">{item.variantInfo}</span>
                        </div>
                        <div className="text-end d-flex align-items-center gap-3">
                          <div>
                            <span className="text-muted small d-block">{formatVND(item.unitPrice)} x {item.quantity}</span>
                            <span className="fw-bold d-block text-dark">{formatVND(item.subtotal || item.unitPrice * item.quantity)}</span>
                          </div>
                          {order.status === 'COMPLETED' && (
                            item.reviewed ? (
                              <Badge bg="light" text="dark" className="rounded-0 border border-dark d-inline-flex align-items-center gap-1">
                                <StarFill className="text-warning" /> Đã đánh giá
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-dark"
                                className="rounded-0 text-uppercase fw-bold border-2"
                                onClick={() => handleOpenReview(item)}
                              >
                                Viết đánh giá
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Bar */}
                  <div className="d-flex align-items-center justify-content-between pt-2">
                    <span className="text-muted small">
                      Kênh đặt: <strong className="text-uppercase text-dark">{order.channel || 'ONLINE'}</strong>
                    </span>
                    <Button
                      variant="outline-dark"
                      className="rounded-0 fw-bold text-uppercase border-2 d-inline-flex align-items-center gap-2"
                      onClick={() => handleOpenDetail(order)}
                    >
                      <Eye /> Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Modal detail */}
      <OrderDetailModal
        show={showModal}
        onHide={() => setShowModal(false)}
        order={selectedOrder}
      />

      {/* Modal viết đánh giá */}
      <ReviewFormModal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        item={reviewItem}
        onSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
