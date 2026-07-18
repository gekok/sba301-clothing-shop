import { useState } from 'react';
import { Container, Row, Col, Alert, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
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
    totals, canCheckout, addAddress
  } = useCheckoutPage();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const handlePlaceOrder = async () => {
    if (!canCheckout) {
      setCheckoutNotice('Vui lòng điền đủ thông tin giao hàng.');
      return;
    }
    setIsPlacingOrder(true);
    setCheckoutNotice('');

    try {
      const requestBody = {
        items: checkoutItems.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
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
          window.location.href = paymentUrl;
          return;
        } else {
          setCheckoutNotice('Không thể tạo liên kết thanh toán VNPAY.');
          setIsPlacingOrder(false);
          return;
        }
      }

      sessionStorage.removeItem('checkout_selected_items');
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
      <Container className="my-5 text-center">
        <Alert variant="danger">
          {errorMessage}
        </Alert>
        <Button variant="dark" className="rounded-0 mt-3" onClick={() => navigate('/cart')}>
          Quay lại Giỏ hàng
        </Button>
      </Container>
    );
  }

  return (
    <section className="checkoutx-shell">
      <Container>
        <header className="checkoutx-hero">
          <p className="checkoutx-overline">Secure Checkout</p>
          <h1 className="checkoutx-title">Thanh toán</h1>
        </header>

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
        show={showSuccessModal}
        onHide={handleViewOrder}
        centered
        backdrop="static"
        keyboard={false}
        className="checkoutx-modal"
      >
        <Modal.Body className="text-center py-5">
          <div className="mb-4 text-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
          </div>
          <h3 className="fw-bold mb-3">
            {selectedPaymentMethod === 'COD' ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
          </h3>
          <p className="text-muted mb-4">
            Cảm ơn bạn đã mua sắm. Mã đơn hàng của bạn là <strong>{orderCode}</strong>.<br />
            {selectedPaymentMethod === 'COD'
              ? 'Chúng tôi sẽ sớm liên hệ để giao hàng.'
              : 'Đơn hàng của bạn đã được thanh toán và đang được chuẩn bị giao cho đơn vị vận chuyển.'}
          </p>
          <Button variant="dark" className="rounded-0 text-uppercase px-4" onClick={handleViewOrder}>
            Xem chi tiết đơn hàng
          </Button>
        </Modal.Body>
      </Modal>

    </section>
  );
}

export default CheckoutLayout;
