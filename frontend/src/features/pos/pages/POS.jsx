// src/features/pos/pages/POS.jsx
// UI 2 — Staff POS: chọn biến thể -> giỏ hàng -> thanh toán -> hoá đơn.
// Dữ liệu thật từ backend: GET /pos/variants, POST /pos/orders.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Form, Button, Table, Stack, Alert, Spinner, Container } from 'react-bootstrap';

import { getPosVariants, createPosOrder } from '../services/posService.js';
import { formatVND } from '../../../shared/utils/format';
import { readApiError } from '../../../shared/utils/apiError.js';
import { CHANNEL_LABEL } from '../../../shared/utils/orderStatus';
import StatusBadge from '../../../shared/components/StatusBadge.jsx';

// Khớp enum PaymentMethod.java. Bán tại quầy thực tế chỉ dùng 2 hình thức này.
const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
];

// Nhãn hiển thị cho 1 biến thể, dùng lại ở cả lưới chọn hàng lẫn dòng trong giỏ.
function buildLabel(variant) {
  return `${variant.productName} - ${variant.size}/${variant.color}`;
}

function POS() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // [{ variantId, label, price, quantity, stock }]
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [invoice, setInvoice] = useState(null); // đơn vừa tạo (null = đang bán)

  const loadVariants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPosVariants();
      setVariants(data);
      setError('');
    } catch (err) {
      setError(readApiError(err, 'Không tải được danh sách sản phẩm.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  // Lọc ngay tại chỗ, không gọi lại API mỗi lần gõ: nhân viên đứng quầy cần
  // danh sách nhảy tức thì, chờ mạng vài trăm ms là khó chịu.
  const filteredVariants = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return variants;
    return variants.filter(
      (v) => buildLabel(v).toLowerCase().includes(kw) || v.sku.toLowerCase().includes(kw),
    );
  }, [search, variants]);

  // Thêm 1 biến thể vào giỏ. Đã có -> tăng số lượng (không vượt tồn).
  function addToCart(variant) {
    setCart((prev) => {
      const existing = prev.find((it) => it.variantId === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stockQuantity) return prev; // chạm trần tồn
        return prev.map((it) =>
          it.variantId === variant.id ? { ...it, quantity: it.quantity + 1 } : it,
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          label: buildLabel(variant),
          price: variant.price,
          quantity: 1,
          stock: variant.stockQuantity,
        },
      ];
    });
  }

  // Tăng/giảm số lượng 1 dòng. Giảm về 0 -> xoá khỏi giỏ. Không vượt tồn.
  function changeQty(variantId, delta) {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.variantId !== variantId) return it;
          const next = it.quantity + delta;
          if (next > it.stock) return it;
          return { ...it, quantity: next };
        })
        .filter((it) => it.quantity > 0),
    );
  }

  function removeItem(variantId) {
    setCart((prev) => prev.filter((it) => it.variantId !== variantId));
  }

  // Tổng tiền = cộng dồn (giá × số lượng) của mọi dòng.
  const total = useMemo(
    () => cart.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [cart],
  );

  // Thanh toán: server mới là nơi trừ kho và sinh mã đơn, client không tự bịa hoá đơn.
  async function handleCheckout() {
    if (cart.length === 0) return;
    try {
      setSubmitting(true);
      const created = await createPosOrder({
        items: cart.map((it) => ({ variantId: it.variantId, quantity: it.quantity })),
        customerName: customerName.trim() || null,
        note: note.trim() || null,
        paymentMethod,
      });
      setInvoice(created);
      setCart([]);
      setCustomerName('');
      setNote('');
      setError('');
      // Bắt buộc tải lại: vừa bán xong nên tồn kho trên server đã giảm,
      // không nạp lại thì lần bán sau vẫn tính theo tồn cũ và bị server từ chối.
      await loadVariants();
    } catch (err) {
      // Hết hàng / sản phẩm ngừng bán -> giữ nguyên giỏ để nhân viên sửa lại.
      setError(readApiError(err, 'Tạo đơn thất bại.'));
    } finally {
      setSubmitting(false);
    }
  }

  // ----- Màn hoá đơn (sau khi thanh toán) -----
  if (invoice) {
    return (
      <Container className="py-4">
        <h1 className="mb-4">Hoá đơn {invoice.orderCode}</h1>
        {/* Phải hiện cả ở màn hoá đơn: nhánh này return sớm, nếu chỉ đặt Alert ở màn bán
            thì lỗi tải lại tồn kho sau khi thanh toán sẽ bị nuốt, nhân viên bán tiếp
            trên số tồn cũ mà không biết. */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Card>
          <Card.Body>
            <p className="mb-1"><strong>Khách:</strong> {invoice.customerName}</p>
            <p className="mb-1"><strong>Kênh:</strong> {CHANNEL_LABEL[invoice.channel] ?? invoice.channel}</p>
            {invoice.createdByStaffName && (
              <p className="mb-1"><strong>Nhân viên:</strong> {invoice.createdByStaffName}</p>
            )}
            {invoice.note && (
              <p className="mb-1"><strong>Ghi chú:</strong> {invoice.note}</p>
            )}
            <p className="mb-3">
              <StatusBadge status={invoice.status} type="order" />{' '}
              <StatusBadge status={invoice.paymentStatus} type="payment" />
            </p>
            <Table bordered size="sm">
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
                {(invoice.items ?? []).map((it) => (
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
            <h4 className="text-end">Tổng: {formatVND(invoice.totalAmount)}</h4>
          </Card.Body>
        </Card>
        <Button className="mt-3" onClick={() => setInvoice(null)}>Tạo đơn mới</Button>
      </Container>
    );
  }

  // ----- Màn bán hàng -----
  return (
    <Container className="py-4">
      <h1 className="mb-4">Bán hàng tại shop (POS)</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="g-3">
        {/* Cột trái: chọn sản phẩm */}
        <Col md={7}>
          <Form.Control
            className="mb-3"
            placeholder="Tìm sản phẩm theo tên hoặc SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" /> Đang tải sản phẩm...
            </div>
          )}

          {!loading && filteredVariants.length === 0 && (
            <p className="text-muted">Không tìm thấy sản phẩm nào.</p>
          )}

          <Row className="g-2">
            {filteredVariants.map((v) => {
              const outOfStock = v.stockQuantity <= 0;
              return (
                <Col xs={12} sm={6} key={v.id}>
                  <Card body>
                    <div className="fw-bold">{v.productName}</div>
                    <div className="text-muted small">{v.size} / {v.color} · {v.sku}</div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span>{formatVND(v.price)}</span>
                      <Button size="sm" disabled={outOfStock} onClick={() => addToCart(v)}>
                        {outOfStock ? 'Hết hàng' : 'Thêm +'}
                      </Button>
                    </div>
                    <div className="text-muted small mt-1">Tồn: {v.stockQuantity}</div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Col>

        {/* Cột phải: giỏ POS */}
        <Col md={5}>
          <Card>
            <Card.Header>Giỏ hàng</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                {/* Nói đúng chỗ tên này được lưu: đơn tại quầy đứng tên tài khoản chung
                    "Khách lẻ", tên gõ ở đây đi vào ghi chú của đơn. */}
                <Form.Label>Tên khách (ghi vào ghi chú đơn)</Form.Label>
                <Form.Control
                  placeholder="Khách lẻ"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hình thức thanh toán</Form.Label>
                <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  placeholder="Không bắt buộc"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>

              {cart.length === 0 ? (
                <p className="text-muted">Chưa có sản phẩm. Bấm &quot;Thêm +&quot; bên trái.</p>
              ) : (
                <Table size="sm" borderless>
                  <tbody>
                    {cart.map((it) => (
                      <tr key={it.variantId}>
                        <td>
                          <div className="small fw-bold">{it.label}</div>
                          <div className="text-muted small">{formatVND(it.price)}</div>
                        </td>
                        <td>
                          <Stack direction="horizontal" gap={1}>
                            <Button size="sm" variant="outline-secondary" onClick={() => changeQty(it.variantId, -1)}>-</Button>
                            <span>{it.quantity}</span>
                            <Button size="sm" variant="outline-secondary" onClick={() => changeQty(it.variantId, 1)}>+</Button>
                          </Stack>
                        </td>
                        <td className="text-end align-middle">{formatVND(it.price * it.quantity)}</td>
                        <td className="align-middle">
                          <Button size="sm" variant="outline-danger" onClick={() => removeItem(it.variantId)}>×</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              <hr />
              <h4 className="d-flex justify-content-between">
                <span>Tổng</span>
                <span>{formatVND(total)}</span>
              </h4>
              <Button
                className="w-100 mt-2"
                variant="success"
                disabled={cart.length === 0 || submitting}
                onClick={handleCheckout}
              >
                {submitting ? 'Đang xử lý...' : 'Thanh toán'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default POS;
