// src/pages/staff/POS.jsx
// UI 2 — Staff POS: chọn variant -> giỏ hàng -> thanh toán tiền mặt -> hoá đơn.
import { useMemo, useState } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Stack } from 'react-bootstrap';

import { MOCK_PRODUCTS } from '../../mock/products';
import { formatVND } from '../../utils/format';

// Làm phẳng (flatten): mỗi sản phẩm có nhiều variant -> 1 danh sách variant phẳng,
// mỗi dòng kèm tên sản phẩm + nhãn gọn để hiển thị/search.
const ALL_VARIANTS = MOCK_PRODUCTS.flatMap((p) =>
  p.variants.map((v) => ({
    ...v,
    productName: p.name,
    label: `${p.name} - ${v.size}/${v.color}`,
  })),
);

function POS() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // [{ variantId, label, price, quantity, stock }]
  const [customerName, setCustomerName] = useState('');
  const [invoice, setInvoice] = useState(null); // đơn vừa tạo (null = đang bán)

  // Lọc danh sách variant theo từ khoá (tên hoặc SKU).
  const filteredVariants = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return ALL_VARIANTS;
    return ALL_VARIANTS.filter(
      (v) => v.label.toLowerCase().includes(kw) || v.sku.toLowerCase().includes(kw),
    );
  }, [search]);

  // Thêm 1 variant vào giỏ. Nếu đã có -> tăng số lượng (không vượt tồn).
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
          label: variant.label,
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

  // Thanh toán: tạo đơn IN_STORE / COMPLETED / PAID rồi hiện hoá đơn.
  function handleCheckout() {
    if (cart.length === 0) return;
    setInvoice({
      orderCode: `POS-${Date.now()}`,
      customerName: customerName.trim() || 'Khách lẻ',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      method: 'CASH',
      items: cart,
      total,
    });
    setCart([]);
    setCustomerName('');
  }

  // ----- Màn hoá đơn (sau khi thanh toán) -----
  if (invoice) {
    return (
      <>
        <h1 className="mb-4">Hoá đơn {invoice.orderCode}</h1>
        <Card>
          <Card.Body>
            <p className="mb-1"><strong>Khách:</strong> {invoice.customerName}</p>
            <p className="mb-1"><strong>Kênh:</strong> Tại shop (IN_STORE)</p>
            <p className="mb-3">
              <Badge bg="dark" className="me-1">{invoice.status}</Badge>
              <Badge bg="success">{invoice.paymentStatus} · {invoice.method}</Badge>
            </p>
            <Table bordered size="sm">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-center">SL</th>
                  <th className="text-end">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it) => (
                  <tr key={it.variantId}>
                    <td>{it.label}</td>
                    <td className="text-end">{formatVND(it.price)}</td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-end">{formatVND(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h4 className="text-end">Tổng: {formatVND(invoice.total)}</h4>
          </Card.Body>
        </Card>
        <Button className="mt-3" onClick={() => setInvoice(null)}>Tạo đơn mới</Button>
      </>
    );
  }

  // ----- Màn bán hàng -----
  return (
    <>
      <h1 className="mb-4">Staff POS — Tạo đơn tại shop</h1>
      <Row className="g-3">
        {/* Cột trái: chọn sản phẩm */}
        <Col md={7}>
          <Form.Control
            className="mb-3"
            placeholder="Tìm sản phẩm theo tên hoặc SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                <Form.Label>Tên khách (để trống = Khách lẻ)</Form.Label>
                <Form.Control
                  placeholder="Khách lẻ"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </Form.Group>

              {cart.length === 0 ? (
                <p className="text-muted">Chưa có sản phẩm. Bấm "Thêm +" bên trái.</p>
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
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                Thanh toán (tiền mặt)
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default POS;
