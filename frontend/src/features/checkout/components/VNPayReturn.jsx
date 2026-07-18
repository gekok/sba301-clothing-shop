import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../../../shared/services/axios.js';

function VNPayReturn() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Convert searchParams to simple object
        const params = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Call backend API to verify and update transaction
        const response = await api.get('/orders/vnpay-callback', { params });
        setOrderDetails(response.data);

        const responseCode = searchParams.get('vnp_ResponseCode');
        if (responseCode === '00') {
          setSuccess(true);
        } else {
          setSuccess(false);
          setErrorMsg(`Giao dịch không thành công. Mã lỗi: ${responseCode}`);
        }
      } catch (err) {
        console.error('Lỗi xác thực thanh toán VNPAY:', err);
        setSuccess(false);
        setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực giao dịch.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center py-5 my-5" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="dark" className="mb-4" />
        <h4 className="text-uppercase fw-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.1em' }}>
          Đang xác thực giao dịch...
        </h4>
        <p className="text-muted">Vui lòng không đóng trình duyệt hoặc tải lại trang.</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 my-5" style={{ maxWidth: '600px' }}>
      <div className="checkoutx-panel p-5 border border-dark border-3" style={{ boxShadow: '8px 8px 0px 0px #000', backgroundColor: '#fff' }}>
        {success ? (
          <div className="text-center">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white" style={{ width: '80px', height: '80px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16">
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
              </svg>
            </div>
            
            <h2 className="fw-bold mb-3 text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Thành toán thành công
            </h2>
            <p className="text-muted mb-4">
              Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được thanh toán và xác nhận.
            </p>

            {orderDetails && (
              <div className="text-start border-top border-bottom border-dark py-3 my-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Mã đơn hàng:</span>
                  <span className="fw-bold">{orderDetails.orderCode}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phương thức:</span>
                  <span className="fw-bold">VNPAY (Online)</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tổng thanh toán:</span>
                  <span className="fw-bold text-danger">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderDetails.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              <Button as={Link} to="/" variant="dark" className="rounded-0 text-uppercase fw-bold py-3">
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 d-inline-flex align-items-center justify-content-center rounded-circle bg-danger text-white" style={{ width: '80px', height: '80px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
              </svg>
            </div>

            <h2 className="fw-bold mb-3 text-uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Thanh toán thất bại
            </h2>
            <p className="text-muted mb-4">
              Rất tiếc, giao dịch thanh toán qua cổng VNPAY đã bị hủy hoặc không thành công.
            </p>

            <Alert variant="danger" className="rounded-0 text-start py-3 mb-4">
              {errorMsg}
            </Alert>

            <div className="d-flex flex-column gap-3">
              <Button as={Link} to="/checkout" variant="dark" className="rounded-0 text-uppercase fw-bold py-3">
                Quay lại trang thanh toán
              </Button>
              <Button as={Link} to="/" variant="outline-dark" className="rounded-0 text-uppercase fw-bold py-3 border-2">
                Trở về trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default VNPayReturn;
