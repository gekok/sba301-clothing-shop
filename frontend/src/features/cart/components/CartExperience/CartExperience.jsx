import { Alert, Button, Col, Form, Modal, Row, Spinner, Stack } from 'react-bootstrap';
import { formatDateTime } from '../../../../shared/utils/format';
import { useCartExperience } from '../../hooks/useCartExperience.js';

import CartItemList from './CartItemList.jsx';
import AddressSelection from './AddressSelection.jsx';
import ShippingSelection from './ShippingSelection.jsx';
import VoucherSelection from './VoucherSelection.jsx';
import OrderSummary from './OrderSummary.jsx';
import '../../styles/cart.css';

function CartExperience() {
  const {
    loading,
    errorMessage,
    items,
    addresses,
    shippingMethods,
    selectedAddressId,
    selectedShippingId,
    selectedItemIds,
    voucherInput,
    voucherNotice,
    orderNote,
    stockSyncNotice,
    lastSyncedAt,
    checkoutNotice,
    checkingOut,
    purchasableItems,
    unavailableCount,
    totals,
    canCheckout,
    allPurchasableSelected,
    selectedAddress,
    setSelectedAddressId,
    setSelectedShippingId,
    setVoucherInput,
    setOrderNote,
    toggleSelectAll,
    toggleItem,
    changeItemQuantity,
    addToCart,
    removeItem,
    clearUnavailableItems,
    applyVoucher,
    reloadCart,
    handleCheckout,
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

        {/* Khu vực kiểm thử (Demo Add to Cart) */}
        {/* <div className="mb-4 p-3 bg-light border border-secondary border-opacity-10">
          <p className="fw-bold mb-2 small text-uppercase" style={{ letterSpacing: '0.05em' }}>
            🧪 Khu vực kiểm thử (Demo Add to Cart)
          </p>
          <Stack direction="horizontal" gap={3} className="flex-wrap">
            <Button
              variant="outline-dark"
              size="sm"
              className="rounded-0"
              onClick={() =>
                addToCart({
                  variantId: 501,
                  productId: 201,
                  productName: 'Áo thun cotton basic',
                  sku: 'AO-COT-M-WHT',
                  size: 'M',
                  color: 'Trắng',
                  unitPrice: 199000,
                  stockQuantity: 50,
                  isActive: true,
                  thumbnail:
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&q=80',
                })
              }
            >
              Thêm Áo Thun Trắng Size M (Đã có - tăng SL)
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              className="rounded-0"
              onClick={() =>
                addToCart({
                  variantId: 503,
                  productId: 201,
                  productName: 'Áo thun cotton basic',
                  sku: 'AO-COT-M-BLK',
                  size: 'M',
                  color: 'Đen',
                  unitPrice: 199000,
                  stockQuantity: 30,
                  isActive: true,
                  thumbnail:
                    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=640&q=80',
                })
              }
            >
              Thêm Áo Thun Đen Size M (Chưa có - thêm dòng mới)
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              className="rounded-0"
              onClick={() =>
                addToCart({
                  variantId: 506,
                  productId: 202,
                  productName: 'Váy hoa mùa hè',
                  sku: 'VAY-HOA-M-RED',
                  size: 'M',
                  color: 'Đỏ',
                  unitPrice: 349000,
                  stockQuantity: 15,
                  isActive: true,
                  thumbnail:
                    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=640&q=80',
                })
              }
            >
              Thêm Váy Hoa Đỏ Size M (Đã có - tăng SL)
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-0"
              onClick={() =>
                addToCart({
                  variantId: 504,
                  productId: 201,
                  productName: 'Áo thun cotton basic',
                  sku: 'AO-COT-L-BLK',
                  size: 'L',
                  color: 'Đen',
                  unitPrice: 199000,
                  stockQuantity: 0,
                  isActive: false,
                  thumbnail:
                    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=640&q=80',
                })
              }
            >
              Thêm Áo L-Đen (Hết hàng - Báo lỗi)
            </Button>
          </Stack>
        </div> */}

        {stockSyncNotice ? (
          <Alert variant={stockSyncNotice.includes('không còn') ? 'warning' : 'info'} className="mb-4">
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
          {/* Main Content: Items */}
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

          {/* Sidebar: Details & Checkout */}
          <Col lg={4}>
            <div className="cartx-sticky">
              <AddressSelection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                selectedAddress={selectedAddress}
                onChange={setSelectedAddressId}
              />

              <ShippingSelection
                shippingMethods={shippingMethods}
                selectedShippingId={selectedShippingId}
                onChange={setSelectedShippingId}
              />

              <VoucherSelection
                voucherInput={voucherInput}
                voucherNotice={voucherNotice}
                onInputChange={setVoucherInput}
                onApply={applyVoucher}
              />

              <div className="cartx-sidebar-block">
                <h2 className="cartx-section-title">Ghi chú</h2>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Yêu cầu đặc biệt..."
                  value={orderNote}
                  onChange={(event) => setOrderNote(event.target.value)}
                />
              </div>

              <OrderSummary
                selectedCount={selectedItemIds.length}
                totals={totals}
                canCheckout={canCheckout}
                checkingOut={checkingOut}
                checkoutNotice={checkoutNotice}
                onCheckout={handleCheckout}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Custom Minimalist Alert Modal */}
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