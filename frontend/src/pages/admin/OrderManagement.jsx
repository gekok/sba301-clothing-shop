// src/pages/admin/OrderManagement.jsx
// UI 1 — Admin quản lý đơn: bảng đơn + lọc + đổi trạng thái động + xem chi tiết.
import { useMemo, useState } from 'react';
import { Table, Form, Button, Modal, Row, Col, Stack } from 'react-bootstrap';

import { MOCK_ORDERS } from '../../mock/orders';
import { formatVND, formatDateTime } from '../../utils/format';
import { getValidTransitions, ORDER_STATUS_LABEL } from '../../utils/orderStatus';
import StatusBadge from '../../components/StatusBadge.jsx';

// Danh sách giá trị để đổ vào ô lọc (khớp enum backend).
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const CHANNELS = ['ONLINE', 'IN_STORE'];

function OrderManagement() {
  // Nguồn dữ liệu: copy từ mock vào state để có thể đổi trạng thái tại chỗ.
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // 3 điều kiện lọc.
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Đơn đang mở modal chi tiết (null = không mở).
  const [detailOrder, setDetailOrder] = useState(null);

  // Lọc đơn theo trạng thái + kênh + mã đơn. useMemo: chỉ tính lại khi input đổi.
  const filteredOrders = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      const matchChannel = channelFilter === 'ALL' || o.channel === channelFilter;
      const matchSearch = o.orderCode.toLowerCase().includes(kw);
      return matchStatus && matchChannel && matchSearch;
    });
  }, [orders, statusFilter, channelFilter, search]);

  // Đổi trạng thái 1 đơn -> tạo MẢNG MỚI (cập nhật bất biến, không sửa trực tiếp).
  function handleChangeStatus(orderId, toStatus) {
    const ok = globalThis.confirm(`Đổi trạng thái sang "${ORDER_STATUS_LABEL[toStatus]}"?`);
    if (!ok) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: toStatus } : o)),
    );
  }

  return (
    <>
      <h1 className="mb-4">Quản lý đơn hàng</h1>

      {/* Thanh lọc */}
      <Row className="g-2 mb-3">
        <Col xs={12} md={3}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Tất cả trạng thái</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={3}>
          <Form.Select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
            <option value="ALL">Tất cả kênh</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{c === 'ONLINE' ? 'Online' : 'Tại shop'}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={6}>
          <Form.Control
            placeholder="Tìm theo mã đơn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      <p className="text-muted">Hiển thị {filteredOrders.length}/{orders.length} đơn</p>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách</th>
            <th>Kênh</th>
            <th className="text-end">Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((o) => (
            <tr key={o.id}>
              <td>
                <Button variant="link" className="p-0" onClick={() => setDetailOrder(o)}>
                  {o.orderCode}
                </Button>
              </td>
              <td>{o.customerName}</td>
              <td>{o.channel === 'ONLINE' ? 'Online' : 'Tại shop'}</td>
              <td className="text-end">{formatVND(o.totalAmount)}</td>
              <td><StatusBadge status={o.status} type="order" /></td>
              <td><StatusBadge status={o.paymentStatus} type="payment" /></td>
              <td>{formatDateTime(o.createdAt)}</td>
              <td>
                <Stack direction="horizontal" gap={1}>
                  {getValidTransitions(o.status).map((action) => (
                    <Button
                      key={action.to}
                      size="sm"
                      variant={action.variant}
                      onClick={() => handleChangeStatus(o.id, action.to)}
                    >
                      {action.label}
                    </Button>
                  ))}
                  {getValidTransitions(o.status).length === 0 && (
                    <span className="text-muted small">—</span>
                  )}
                </Stack>
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-muted py-4">
                Không có đơn nào khớp bộ lọc.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal chi tiết đơn */}
      <Modal show={detailOrder !== null} onHide={() => setDetailOrder(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn {detailOrder?.orderCode}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailOrder && (
            <>
              <p className="mb-1"><strong>Khách:</strong> {detailOrder.customerName}</p>
              <p className="mb-1">
                <strong>Kênh:</strong>{' '}
                {detailOrder.channel === 'ONLINE' ? 'Online' : 'Tại shop'}
                {detailOrder.createdByStaffName && ` (NV: ${detailOrder.createdByStaffName})`}
              </p>
              {detailOrder.shippingAddress && (
                <p className="mb-1"><strong>Giao tới:</strong> {detailOrder.shippingAddress}</p>
              )}
              {detailOrder.note && (
                <p className="mb-1"><strong>Ghi chú:</strong> {detailOrder.note}</p>
              )}

              <h6 className="mt-3">Sản phẩm</h6>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Phân loại</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-center">SL</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.productName}</td>
                      <td>{it.variantInfo}</td>
                      <td className="text-end">{formatVND(it.unitPrice)}</td>
                      <td className="text-center">{it.quantity}</td>
                      <td className="text-end">{formatVND(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="text-end">
                <div>Tạm tính: {formatVND(detailOrder.subtotal)}</div>
                <div>Phí ship: {formatVND(detailOrder.shippingFee)}</div>
                <div className="fw-bold">Tổng: {formatVND(detailOrder.totalAmount)}</div>
              </div>

              <h6 className="mt-3">Thanh toán</h6>
              {detailOrder.payments.length === 0 ? (
                <p className="text-muted">Chưa có giao dịch thanh toán.</p>
              ) : (
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Phương thức</th>
                      <th className="text-end">Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.method}</td>
                        <td className="text-end">{formatVND(p.amount)}</td>
                        <td>{p.status}</td>
                        <td>{formatDateTime(p.paidAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetailOrder(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrderManagement;
