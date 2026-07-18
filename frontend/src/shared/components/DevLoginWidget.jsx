import { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import api from '../services/axios.js';

function DevLoginWidget() {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (email, password, role, fullName) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Try to register first, just in case user is not seeded
      try {
        await api.post('/auth/register', {
          email,
          password,
          fullName,
          phone: '0987654321',
          role
        });
      } catch (regErr) {
        // If already exists, ignore and login
      }

      // 2. Perform Login
      const loginRes = await api.post('/auth/login', { email, password });
      const { accessToken } = loginRes.data;
      
      localStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Không thể đăng nhập tài khoản test.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    window.location.reload();
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          fontFamily: "'Space Grotesk', sans-serif"
        }}
      >
        {token ? (
          <div className="d-flex align-items-center gap-2 bg-dark text-white p-2 border border-white border-2" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
            <span className="small text-uppercase fw-bold" style={{ fontSize: '0.75rem', paddingLeft: '5px' }}>
              Test Mode: Active
            </span>
            <Button 
              size="sm" 
              variant="outline-light" 
              className="rounded-0 text-uppercase fw-bold" 
              style={{ fontSize: '0.7rem' }} 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button 
            variant="danger" 
            className="rounded-0 text-uppercase fw-bold p-3 border border-dark border-2" 
            style={{ boxShadow: '4px 4px 0px 0px #000', fontSize: '0.85rem' }}
            onClick={() => setShowModal(true)}
          >
            🔑 Dev Login (Quick Test)
          </Button>
        )}
      </div>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        centered
        className="checkoutx-modal"
        backdropClassName="checkoutx-modal-backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title>Bảng Điều Khiển Nhà Phát Triển</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            Công cụ này tự động kiểm tra và tạo tài khoản mẫu trong Database, đăng nhập và lưu JWT token vào localStorage để bạn kiểm thử các chức năng giỏ hàng và thanh toán mà không cần qua luồng đăng ký phức tạp.
          </p>

          {errorMsg && <Alert variant="danger" className="rounded-0 small">{errorMsg}</Alert>}

          <div className="d-grid gap-3">
            <Button 
              variant="dark" 
              className="rounded-0 text-uppercase fw-bold py-3 text-start d-flex justify-content-between align-items-center"
              onClick={() => handleQuickLogin('customer@sba301.local', 'password123', 'CUSTOMER', 'Khách hàng thử nghiệm')}
              disabled={loading}
            >
              <span>👤 Login as CUSTOMER (Test mua hàng)</span>
              <span className="small opacity-50">&rarr;</span>
            </Button>

            <Button 
              variant="outline-dark" 
              className="rounded-0 text-uppercase fw-bold py-3 text-start d-flex justify-content-between align-items-center border-2"
              onClick={() => handleQuickLogin('admin@sba301.local', 'password123', 'ADMIN', 'Quản trị viên hệ thống')}
              disabled={loading}
            >
              <span>🔑 Login as ADMIN (Quản lý)</span>
              <span className="small opacity-50">&rarr;</span>
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" className="rounded-0 text-uppercase fw-bold" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DevLoginWidget;
