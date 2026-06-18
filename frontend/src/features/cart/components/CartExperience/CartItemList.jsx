import { Alert, Button, Col, Form, Stack } from 'react-bootstrap';
import CartItemCard from './CartItemCard.jsx';
function CartItemList({
  items,
  selectedItemIds,
  purchasableCount,
  unavailableCount,
  allPurchasableSelected,
  onToggleSelectAll,
  onReloadCart,
  onClearUnavailable,
  onToggleItem,
  onChangeQuantity,
  onRemoveItem,
}) {
  return (
    <Col lg={8}>
      <div className="cartx-panel">
        <Stack direction="horizontal" className="justify-content-between flex-wrap" gap={2}>
          <Form.Check
            id="select-all-items"
            type="checkbox"
            label={`Chọn tất cả (${purchasableCount} sản phẩm)`}
            checked={allPurchasableSelected}
            onChange={onToggleSelectAll}
          />
          <button className="cartx-icon-btn" onClick={onReloadCart}>
            Làm mới
          </button>
        </Stack>

        {unavailableCount > 0 ? (
          <Alert variant="warning" className="mt-3 mb-0 rounded-0">
            <Stack direction="horizontal" className="justify-content-between flex-wrap" gap={2}>
              <span>
                Có {unavailableCount} sản phẩm hết hàng hoặc tạm ẩn. Bạn nên xoá để tránh lỗi.
              </span>
              <Button variant="outline-dark" className="rounded-0" size="sm" onClick={onClearUnavailable}>
                Xoá sản phẩm không khả dụng
              </Button>
            </Stack>
          </Alert>
        ) : null}
      </div>

      <div className="cartx-list">
        {items.length === 0 ? (
          <div className="cartx-empty py-5">
            <h2 className="cartx-section-title border-0 mb-2">Giỏ hàng trống</h2>
            <p className="text-muted">
              Bạn chưa có sản phẩm nào. Hãy tiếp tục mua sắm.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              checked={selectedItemIds.includes(item.id)}
              onToggle={onToggleItem}
              onChangeQuantity={onChangeQuantity}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>
    </Col>
  );
}

export default CartItemList;
