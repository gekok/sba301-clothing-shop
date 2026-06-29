import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Modal, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentMethodSelector from './PaymentMethodSelector';
import CheckoutSummary from './CheckoutSummary';
import '../styles/checkout.css';
import api from '../../../shared/services/axios.js';

function CheckoutLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = location.state;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  useEffect(() => {
    if (!payload || !payload.checkoutItems || payload.checkoutItems.length === 0) {
      navigate('/cart');
    }
  }, [payload, navigate]);

  if (!payload) return null;

  const { checkoutItems, selectedAddress, shippingMethod, totals, orderNote } = payload;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    
    try {
      const requestBody = {
        items: checkoutItems.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
        shippingAddressId: selectedAddress?.id,
        paymentMethod: selectedPaymentMethod,
        note: orderNote,
      };
      
      const response = await api.post('/orders', requestBody);
      const { orderCode, paymentUrl } = response.data;
      
      setOrderCode(orderCode);

      if (paymentUrl) {
         window.location.href = paymentUrl; 
      } else {
        setShowSuccessModal(true);
      }

    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleViewOrder = () => {
    setShowSuccessModal(false);
    navigate(`/order/${orderCode}`);
  };

  return (
    <section className="checkoutx-shell">
      <Container>
        <header className="checkoutx-hero">
          <p className="cartx-overline">Secure Checkout</p>
          <h1 className="checkoutx-title">Thanh toán</h1>
        </header>

        <Row className="g-5">
          <Col lg={7}>
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
            />
          </Col>

          <Col lg={5}>
            <div className="cartx-sticky">
              <CheckoutSummary
                items={checkoutItems}
                totals={totals}
                shippingMethod={shippingMethod}
                address={selectedAddress}
                checkingOut={isPlacingOrder}
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
        className="cartx-modal"
      >
        <Modal.Body className="text-center py-5">
          <div className="mb-4 text-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
          </div>
          <h3 className="fw-bold mb-3">Đặt hàng thành công!</h3>
          <p className="text-muted mb-4">
            Cảm ơn bạn đã mua sắm. Mã đơn hàng của bạn là <strong>{orderCode}</strong>.<br />
            Chúng tôi sẽ sớm liên hệ để giao hàng.
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
