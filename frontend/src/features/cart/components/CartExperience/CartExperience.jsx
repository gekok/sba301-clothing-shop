import { Alert, Button, Col, Modal, Row, Spinner, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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
    handleAcknowledgeChanges,
  } = useCartExperience();

  if (loading) {
    return (
      <div className="cartx-loading">
        <Spinner animation="border" role="status" variant="dark" />
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));

  if (!isAuthenticated) {
    return (
      <div className="container text-center py-5 my-5" style={{ maxWidth: '500px' }}>
        <div className="checkoutx-panel p-5 border border-dark border-3" style={{ boxShadow: '8px 8px 0px 0px #000', backgroundColor: '#fff' }}>
          <h2 className="fw-bold mb-4 text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Yêu cầu Đăng nhập
          </h2>
          <p className="text-muted mb-4">
            Vui lòng đăng nhập hoặc đăng ký tài khoản của bạn để quản lý giỏ hàng và tiến hành thanh toán.
          </p>
          <div className="d-flex flex-column gap-3">
            <Button
              as={Link}
              to="/login"
              variant="dark"
              className="w-100 rounded-0 text-uppercase fw-bold py-3"
            >
              Đăng nhập ngay
            </Button>
            <Button
              as={Link}
              to="/register"
              variant="outline-dark"
              className="w-100 rounded-0 text-uppercase fw-bold py-3 border-2"
            >
              Đăng ký tài khoản mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container text-center py-5 my-5" style={{ maxWidth: '500px' }}>
        <div className="checkoutx-panel p-5 border border-dark border-3" style={{ boxShadow: '8px 8px 0px 0px #000', backgroundColor: '#fff' }}>
          <div className="text-danger mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
          </div>
          <h2 className="fw-bold mb-4 text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Đã có lỗi xảy ra
          </h2>
          <p className="text-muted mb-4">
            {errorMessage}
          </p>
          <Button
            variant="dark"
            className="w-100 rounded-0 text-uppercase fw-bold py-3"
            onClick={reloadCart}
          >
            Thử lại
          </Button>
        </div>
      </div>
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
        show={Boolean(cartAlert && cartAlert.isFromCheckout)}
        onHide={() => setCartAlert(null)}
        centered
        backdrop="static"
        keyboard={false}
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
          {cartAlert?.isConfirm ? (
            <div className="py-2">
              <p>Một số sản phẩm trong giỏ hàng của bạn đã có sự thay đổi về số lượng tồn kho thực tế:</p>
              
              {cartAlert.removedItems?.length > 0 && (
                <div className="mb-3">
                  <strong>Sản phẩm đã hết hàng (bị loại bỏ):</strong>
                  <ul className="mb-0 text-danger mt-1">
                    {cartAlert.removedItems.map(item => (
                      <li key={item.id}>
                        {item.productName} - {item.color}, Size {item.size}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cartAlert.adjustedItems?.length > 0 && (
                <div className="mb-3">
                  <strong>Sản phẩm bị giảm số lượng:</strong>
                  <ul className="mb-0 text-warning mt-1">
                    {cartAlert.adjustedItems.map(item => (
                      <li key={item.id}>
                        {item.productName} - {item.color}, Size {item.size} 
                        <br/>
                        <span className="small text-muted">(Từ {item.oldQuantity} giảm xuống còn {item.newQuantity})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <p className="mb-0 mt-3 text-muted">
                {cartAlert.isFromCheckout 
                  ? "Bạn có muốn tự động cập nhật và tiếp tục thanh toán không?"
                  : "Hệ thống sẽ tự động cập nhật lại số lượng trong giỏ hàng của bạn."}
              </p>
            </div>
          ) : (
            <p className="mb-0 text-center py-3">{cartAlert?.message}</p>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          {cartAlert?.isConfirm ? (
            <Stack direction="horizontal" gap={3} className="w-100">
               <Button variant="outline-dark" className="w-50 rounded-0 text-uppercase fw-bold" onClick={() => handleAcknowledgeChanges(false)}>
                 {cartAlert.isFromCheckout ? "Hủy" : "Đóng"}
               </Button>
               <Button variant="dark" className="w-50 rounded-0 text-uppercase fw-bold" onClick={() => handleAcknowledgeChanges(cartAlert.isFromCheckout)}>
                 {cartAlert.isFromCheckout ? "Đồng ý" : "Cập nhật"}
               </Button>
            </Stack>
          ) : (
            <Button
              variant="dark"
              className="w-100 rounded-0 text-uppercase fw-bold"
              onClick={() => setCartAlert(null)}
            >
              Đã hiểu
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Background Sync Toast */}
      {cartAlert && !cartAlert.isFromCheckout && (
        <div 
          className="position-fixed bottom-0 end-0 p-4" 
          style={{ zIndex: 1050 }}
        >
          <div className="bg-dark text-white p-4 rounded-0 shadow-lg border border-3 border-dark" style={{ width: '360px', boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.2)' }}>
            <h5 className="fw-bold mb-2 text-warning text-uppercase" style={{ letterSpacing: '0.05em' }}>⚠️ Tồn kho thay đổi</h5>
            <p className="small mb-4 text-light opacity-75">
              Số lượng tồn kho thực tế của một số sản phẩm đã giảm xuống thấp hơn số lượng trong giỏ hàng.
            </p>
            <Button 
              variant="light" 
              className="w-100 rounded-0 fw-bold text-uppercase py-2"
              onClick={() => handleAcknowledgeChanges(false)}
            >
              Cập nhật lại giỏ hàng
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartExperience;