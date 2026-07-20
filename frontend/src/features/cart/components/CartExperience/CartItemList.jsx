import { Alert, Button, Col, Form, Stack } from 'react-bootstrap';
import CartItemCard from './CartItemCard.jsx';
import { Link } from 'react-router-dom';

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
          <div className="cartx-empty text-center py-5">
            <div className="mb-4 text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-bag-x" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M6.146 8.146a.5.5 0 0 1 .708 0L8 9.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 10l1.147 1.146a.5.5 0 0 1-.708.708L8 10.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 10 6.146 8.854a.5.5 0 0 1 0-.708z"/>
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
              </svg>
            </div>
            <h2 className="cartx-section-title border-0 mb-2">Giỏ hàng trống</h2>
            <p className="text-muted mb-4">
              Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy lướt xem các sản phẩm hấp dẫn của chúng tôi.
            </p>
            <Link to="/products" className="btn btn-dark rounded-0 px-4 py-2 text-uppercase fw-bold">
              Tiếp tục mua sắm
            </Link>
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
