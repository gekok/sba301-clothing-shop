import { Alert, Button, Col, Modal, Row, Spinner, Stack } from 'react-bootstrap';
import { formatDateTime, formatVND } from '../../../../shared/utils/format';
import { useCartExperience } from '../../hooks/useCartExperience.js';

import CartItemList from './CartItemList.jsx';
import '../../styles/cart.css';

function CartExperience() {
  const {
    loading,
    errorMessage,
    items,
    selectedItemIds,
    stockSyncNotice,
    lastSyncedAt,
    purchasableItems,
    unavailableCount,
    allPurchasableSelected,
    itemsSubtotal,
    toggleSelectAll,
    toggleItem,
    changeItemQuantity,
    removeItem,
    clearUnavailableItems,
    reloadCart,
    proceedToCheckout,
    cartAlert,
    setCartAlert,
  } = useCartExperience();

  if (loading) {
    return (
      <div className="cartx-loading">
        <Spinner animation="border" role="status" variant="dark" />
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <Alert variant="danger" className="mb-0 rounded-0">
        <Stack direction="horizontal" gap={3} className="justify-content-between align-items-center">
          <span>{errorMessage}</span>
          <Button variant="outline-dark" size="sm" className="rounded-0" onClick={reloadCart}>
            Thử lại
          </Button>
        </Stack>
      </Alert>
    );
  }

  return (
    <section className="cartx-shell">
      <div className="container">
        <header className="cartx-hero">
          <p className="cartx-overline">Your Bag</p>
          <h1 className="cartx-title">Giỏ hàng</h1>
          <p className="cartx-subtitle">
            Miễn phí giao hàng cho đơn từ 1.000.000đ. Trả hàng miễn phí trong 30 ngày.
          </p>
        </header>

        {stockSyncNotice ? (
          <Alert variant={stockSyncNotice.includes('loại') ? 'warning' : 'info'} className="mb-4">
            <Stack className="gap-1">
              <strong>{stockSyncNotice}</strong>
              {lastSyncedAt && (
                <small className="text-muted">
                  Cập nhật: {formatDateTime(lastSyncedAt.toISOString())}
                </small>
              )}
            </Stack>
          </Alert>
        ) : null}

        <Row className="g-5">
          <CartItemList
            items={items}
            selectedItemIds={selectedItemIds}
            purchasableCount={purchasableItems.length}
            unavailableCount={unavailableCount}
            allPurchasableSelected={allPurchasableSelected}
            onToggleSelectAll={toggleSelectAll}
            onReloadCart={reloadCart}
            onClearUnavailable={clearUnavailableItems}
            onToggleItem={toggleItem}
            onChangeQuantity={changeItemQuantity}
            onRemoveItem={removeItem}
          />

          <Col lg={4}>
            <div className="cartx-sticky">
              <div className="cartx-panel">
                <h2 className="cartx-section-title">Tóm tắt giỏ hàng</h2>
                <Stack gap={2} className="mb-4">
                  <div className="d-flex justify-content-between small">
                    <span className="text-muted">Sản phẩm chọn ({selectedItemIds.length})</span>
                    <span>{formatVND(itemsSubtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <span className="text-uppercase fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>Tạm tính</span>
                    <strong className="fs-4">{formatVND(itemsSubtotal)}</strong>
                  </div>
                </Stack>
                <Button
                  variant="dark"
                  size="lg"
                  className="w-100 rounded-0 text-uppercase fw-bold"
                  style={{ letterSpacing: '0.05em' }}
                  disabled={selectedItemIds.length === 0}
                  onClick={proceedToCheckout}
                >
                  Tiến hành thanh toán
                </Button>
                <p className="text-center text-muted small mt-3 mb-0">
                  Phí vận chuyển và Khuyến mãi sẽ được tính ở bước sau.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Modal
        show={Boolean(cartAlert)}
        onHide={() => setCartAlert(null)}
        centered
        className="cartx-modal"
        backdropClassName="cartx-modal-backdrop"
      >
        <Modal.Header closeButton className={`cartx-modal-header-${cartAlert?.type || 'default'}`}>
          <Modal.Title>
            {cartAlert?.type === 'danger' && <span className="text-danger me-2">■</span>}
            {cartAlert?.type === 'warning' && <span className="text-warning me-2">▲</span>}
            {cartAlert?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0 text-center py-3">{cartAlert?.message}</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            variant="dark"
            className="w-100 rounded-0 text-uppercase fw-bold"
            onClick={() => setCartAlert(null)}
          >
            Đã hiểu
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default CartExperience;