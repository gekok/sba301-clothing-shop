// src/features/orders/pages/OrderManagement.jsx
// UI 1 — Admin quản lý đơn: bảng đơn + lọc + đổi trạng thái động + xem chi tiết.
// Dữ liệu lấy thật từ backend: GET /admin/orders, PUT /admin/orders/{id}/status.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Form, Button, Modal, Row, Col, Stack, Alert, Spinner, Container } from 'react-bootstrap';

import { getOrders, updateOrderStatus } from '../services/orderService.js';
import { formatVND, formatDateTime } from '../../../shared/utils/format';
import { readApiError } from '../../../shared/utils/apiError.js';
import { getValidTransitions, ORDER_STATUS_LABEL, CHANNEL_LABEL } from '../../../shared/utils/orderStatus';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';

// Danh sách giá trị để đổ vào ô lọc (khớp enum backend).
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const CHANNELS = ['ONLINE', 'IN_STORE'];

// Chờ 400ms sau khi ngừng gõ mới gọi API, tránh mỗi ký tự 1 request.
// Cùng cách làm với ProductList.jsx của nhóm sản phẩm.
const SEARCH_DEBOUNCE_MS = 400;

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // true ngay từ đầu vì vừa vào là gọi API
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null); // id đơn đang chờ server trả lời

  // 3 điều kiện lọc. Cả 3 đều đẩy xuống server, không lọc tại chỗ.
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Đơn đang mở modal chi tiết (null = không mở).
  const [detailOrder, setDetailOrder] = useState(null);

  // Gõ tới đâu hẹn giờ tới đó; gõ tiếp thì huỷ hẹn cũ (clearTimeout trong hàm dọn dẹp).
  useEffect(() => {
    // globalThis.* thay vì gọi trần: cấu hình eslint của dự án chưa khai báo biến
    // toàn cục của trình duyệt, gọi trần sẽ bị báo no-undef (giống globalThis.confirm bên dưới).
    const timer = globalThis.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(timer);
  }, [search]);

  // Số thứ tự của lần gọi API gần nhất. Đổi bộ lọc liên tiếp sẽ có nhiều request bay
  // cùng lúc, và request cũ (quét nhiều dữ liệu hơn) có thể về SAU request mới rồi ghi
  // đè kết quả đúng. Chỉ nhận kết quả của lần gọi mới nhất.
  const latestRequestRef = useRef(0);

  // useCallback để hàm chỉ được tạo lại khi bộ lọc đổi -> effect bên dưới không chạy vô tận.
  const loadOrders = useCallback(async () => {
    const requestId = ++latestRequestRef.current;
    try {
      setLoading(true);
      const data = await getOrders({
        status: statusFilter,
        channel: channelFilter,
        keyword: debouncedSearch,
      });
      if (requestId !== latestRequestRef.current) return; // đã có lần gọi mới hơn
      setOrders(data);
      setError('');
    } catch (err) {
      if (requestId !== latestRequestRef.current) return;
      setError(readApiError(err, 'Không tải được danh sách đơn hàng.'));
    } finally {
      // Chỉ request mới nhất được tắt spinner, tránh tắt trong khi request kia còn chạy.
      if (requestId === latestRequestRef.current) setLoading(false);
    }
  }, [statusFilter, channelFilter, debouncedSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Đổi trạng thái: gọi server trước, server đồng ý mới tải lại bảng.
  // Tải lại (thay vì sửa 1 dòng tại chỗ) vì đơn có thể văng ra khỏi bộ lọc đang xem:
  // đang lọc "Chờ xác nhận" mà bấm Xác nhận thì đơn đó phải biến mất khỏi danh sách.
  async function handleChangeStatus(orderId, toStatus) {
    const ok = globalThis.confirm(`Đổi trạng thái sang "${ORDER_STATUS_LABEL[toStatus]}"?`);
    if (!ok) return;
    try {
      setSavingId(orderId);
      await updateOrderStatus(orderId, toStatus);
      setError('');
      await loadOrders();
    } catch (err) {
      // Server từ chối (vd chuyển sai luật) -> bảng giữ nguyên, không lệch với DB.
      setError(readApiError(err, 'Đổi trạng thái thất bại.'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Quản lý đơn hàng</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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
              <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={6}>
          <Form.Control
            placeholder="Tìm theo mã đơn hoặc tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      <p className="text-muted">Hiển thị {orders.length} đơn</p>

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
          {orders.map((o) => {
            // Tính 1 lần rồi dùng lại: trước đó gọi getValidTransitions 2 lần cho mỗi dòng.
            const actions = getValidTransitions(o.status);
            return (
              <tr key={o.id}>
                <td>
                  <Button variant="link" className="p-0" onClick={() => setDetailOrder(o)}>
                    {o.orderCode}
                  </Button>
                </td>
                <td>{o.customerName}</td>
                <td>{CHANNEL_LABEL[o.channel] ?? o.channel}</td>
                <td className="text-end">{formatVND(o.totalAmount)}</td>
                <td><StatusBadge status={o.status} type="order" /></td>
                <td><StatusBadge status={o.paymentStatus} type="payment" /></td>
                <td>{formatDateTime(o.createdAt)}</td>
                <td>
                  <Stack direction="horizontal" gap={1}>
                    {actions.map((action) => (
                      <Button
                        key={action.to}
                        size="sm"
                        variant={action.variant}
                        disabled={savingId === o.id}
                        onClick={() => handleChangeStatus(o.id, action.to)}
                      >
                        {action.label}
                      </Button>
                    ))}
                    {actions.length === 0 && (
                      <span className="text-muted small">—</span>
                    )}
                  </Stack>
                </td>
              </tr>
            );
          })}
          {loading && (
            <tr>
              <td colSpan={8} className="text-center py-4">
                <Spinner animation="border" size="sm" /> Đang tải...
              </td>
            </tr>
          )}
          {!loading && orders.length === 0 && (
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
                {CHANNEL_LABEL[detailOrder.channel] ?? detailOrder.channel}
                {detailOrder.createdByStaffName && ` (NV: ${detailOrder.createdByStaffName})`}
              </p>
              <p className="mb-1">
                <strong>Thanh toán:</strong>{' '}
                <StatusBadge status={detailOrder.paymentStatus} type="payment" />
              </p>
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
                  {/* ?? [] phòng khi backend đổi shape: items thiếu là cả trang trắng */}
                  {(detailOrder.items ?? []).map((it) => (
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetailOrder(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderManagement;
