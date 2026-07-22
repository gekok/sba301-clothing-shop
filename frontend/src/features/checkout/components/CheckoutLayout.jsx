import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate, Link, useBlocker } from 'react-router-dom';
import PaymentMethodSelector from './PaymentMethodSelector';
import CheckoutSummary from './CheckoutSummary';
import { useCheckoutPage } from '../hooks/useCheckoutPage.js';
import '../styles/checkout.css';
import api from '../../../shared/services/axios.js';

import AddressSelection from './AddressSelection.jsx';
import ShippingSelection from './ShippingSelection.jsx';
import VoucherSelection from './VoucherSelection.jsx';

function CheckoutLayout() {
  const navigate = useNavigate();
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
  const {
    loading, errorMessage, checkoutItems, addresses, shippingMethods,
    selectedAddressId, setSelectedAddressId, selectedAddress,
    selectedShippingId, setSelectedShippingId, selectedShippingMethod,
    voucherInput, setVoucherInput, voucherApplied, voucherNotice, applyVoucher,
    orderNote, setOrderNote,
    selectedPaymentMethod, setSelectedPaymentMethod,
    isPlacingOrder, setIsPlacingOrder, checkoutNotice, setCheckoutNotice,
    totals, canCheckout, addAddress,
    sessionId, sessionExpiresAt
  } = useCheckoutPage();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Blocker logic to prevent accidental leaving
  let blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (isOrderCompleted) return false;
      if (currentLocation.pathname !== nextLocation.pathname && !isSessionExpired && sessionId) {
        return true;
      }
      return false;
    }
  );

  useEffect(() => {
    if (!sessionExpiresAt) return;
    
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const expiresTime = new Date(sessionExpiresAt).getTime();
      const distance = expiresTime - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setTimeLeft(0);
        setIsSessionExpired(true);
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionExpiresAt]);

  const formatTimeLeft = (ms) => {
    if (ms === null || ms <= 0) return "00:00";
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlaceOrder = async () => {
    if (!canCheckout) {
      setCheckoutNotice('Vui lòng điền đủ thông tin giao hàng.');
      return;
    }
    if (isSessionExpired) {
      setCheckoutNotice('Phiên thanh toán đã hết hạn, vui lòng quay lại giỏ hàng.');
      return;
    }
    
    setIsPlacingOrder(true);
    setCheckoutNotice('');

    try {
      const requestBody = {
        sessionId: sessionId,
        shippingAddressId: selectedAddress?.id,
        paymentMethod: selectedPaymentMethod,
        note: orderNote,
        voucherCode: voucherApplied?.code || null,
        shippingFee: totals.shippingFee,
      };

      let newOrderCode, paymentUrl;
      const response = await api.post('/orders', requestBody);
      newOrderCode = response.data.orderCode;
      paymentUrl = response.data.paymentUrl;

      setOrderCode(newOrderCode);

      if (selectedPaymentMethod === 'VNPAY') {
        if (paymentUrl) {
          sessionStorage.removeItem('checkout_selected_items');
          setIsOrderCompleted(true);
          window.location.href = paymentUrl;
          return;
        } else {
          setCheckoutNotice('Không thể tạo liên kết thanh toán VNPAY.');
          setIsPlacingOrder(false);
          return;
        }
      }

      sessionStorage.removeItem('checkout_selected_items');
      setIsOrderCompleted(true);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      setCheckoutNotice("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleViewOrder = () => {
    setShowSuccessModal(false);
    navigate(`/order/${orderCode}`);
  };

  if (loading) {
    return (
      <div className="checkoutx-loading">
        <Spinner animation="border" role="status" variant="dark" />
        <p className="mt-3 text-muted">Đang tải thông tin thanh toán...</p>
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
            Không có sản phẩm
          </h2>
          <p className="text-muted mb-4">
            {errorMessage}
          </p>
          <Button
            variant="dark"
            className="w-100 rounded-0 text-uppercase fw-bold py-3"
            onClick={() => navigate('/cart')}
          >
            Quay lại Giỏ hàng
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="checkoutx-shell">
      <Container>
        <header className="checkoutx-hero">
          <p className="checkoutx-overline">Secure Checkout</p>
          <h1 className="checkoutx-title">Thanh toán</h1>
        </header>

        {timeLeft !== null && (
          <div className="alert alert-warning text-center fw-bold rounded-0 py-3 mb-4" style={{border: '2px solid #000'}}>
            🕒 Giỏ hàng đang được giữ chỗ trong: <span className="fs-5 text-danger">{formatTimeLeft(timeLeft)}</span>
          </div>
        )}

        {checkoutNotice && (
          <Alert variant="danger" className="mb-4 rounded-0">{checkoutNotice}</Alert>
        )}

        <Row className="g-5">
          <Col lg={7}>
            <div className="checkoutx-panel mb-4">
              <h2 className="checkoutx-section-title">1. Thông tin Giao hàng</h2>
              <AddressSelection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                selectedAddress={selectedAddress}
                onChange={setSelectedAddressId}
                onAddAddress={addAddress}
              />
            </div>

            <div className="checkoutx-panel mb-4">
              <h2 className="checkoutx-section-title">2. Phương thức Vận chuyển</h2>
              <ShippingSelection
                shippingMethods={shippingMethods}
                selectedShippingId={selectedShippingId}
                onChange={setSelectedShippingId}
              />
            </div>

            <div className="checkoutx-panel mb-4">
              <h2 className="checkoutx-section-title">3. Khuyến mãi</h2>
              <VoucherSelection
                voucherInput={voucherInput}
                voucherNotice={voucherNotice}
                onInputChange={setVoucherInput}
                onApply={applyVoucher}
              />
            </div>

            <div className="checkoutx-panel mb-4">
              <h2 className="checkoutx-section-title">4. Phương thức Thanh toán</h2>
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
              />
            </div>

            <div className="checkoutx-panel mb-4">
              <h2 className="checkoutx-section-title">5. Ghi chú Đơn hàng</h2>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ví dụ: Giao hàng giờ hành chính..."
                value={orderNote}
                onChange={(event) => setOrderNote(event.target.value)}
              />
            </div>
          </Col>

          <Col lg={5}>
            <div className="checkoutx-sticky">
              <CheckoutSummary
                items={checkoutItems}
                totals={totals}
                shippingMethod={selectedShippingMethod}
                address={selectedAddress}
                checkingOut={isPlacingOrder}
                canCheckout={canCheckout}
                onPlaceOrder={handlePlaceOrder}
              />
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showSuccessModal || isSessionExpired}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        centered
        className="checkoutx-success-modal"
      >
        <Modal.Body className="text-center p-5">
          {isSessionExpired ? (
            <>
              <div className="mb-4 text-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                </svg>
              </div>
              <h2 className="mb-3 fw-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Hết thời gian giữ chỗ!</h2>
              <p className="text-muted mb-4 fs-5">
                Phiên thanh toán của bạn đã hết hạn. Vui lòng quay lại giỏ hàng để cập nhật và thử lại.
              </p>
              <Button 
                variant="dark" 
                size="lg"
                className="w-100 rounded-0 fw-bold text-uppercase" 
                onClick={() => navigate('/cart')}
              >
                Quay lại Giỏ hàng
              </Button>
            </>
          ) : (
            <>
              <div className="mb-4 text-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
              </div>
              <h2 className="mb-3 fw-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Đặt hàng thành công!</h2>
              <p className="text-muted mb-4 fs-5">
                Mã đơn hàng của bạn là <strong className="text-dark">{orderCode}</strong>
              </p>
              <Button 
                variant="dark" 
                size="lg"
                className="w-100 rounded-0 fw-bold text-uppercase" 
                onClick={handleViewOrder}
              >
                Xem chi tiết đơn hàng
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal 
        show={blocker.state === 'blocked'} 
        onHide={() => blocker.reset?.()} 
        centered
        className="checkoutx-modal"
      >
        <Modal.Header className="border-0 pb-0" closeButton>
          <Modal.Title className="fw-bold text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Hủy thanh toán?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-1 text-dark fw-medium">Việc đặt trước của bạn sẽ bị hủy.</p>
          <p className="mb-0 text-muted small">Sản phẩm trong giỏ hàng sẽ không còn được giữ chỗ và có nguy cơ bị người khác mua mất. Bạn có chắc chắn muốn rời khỏi trang thanh toán không?</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex gap-2">
          <Button variant="outline-dark" className="rounded-0 text-uppercase fw-bold flex-grow-1" onClick={() => blocker.reset?.()}>
            Ở lại
          </Button>
          <Button variant="danger" className="rounded-0 text-uppercase fw-bold flex-grow-1" onClick={async () => {
            try {
              await api.delete(`/checkout/session/${sessionId}`);
            } catch (e) {
              console.error(e);
            }
            blocker.proceed?.();
          }}>
            Rời đi
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}

export default CheckoutLayout;
