import { Link } from 'react-router-dom';
import { Button, Card, Form, Nav } from 'react-bootstrap';
import './AuthPages.css';

export default function Login() {
  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <Nav className="auth-tabs">
          <Nav.Item>
            <Nav.Link as={Link} to="/login" className="auth-tab active">ĐĂNG NHẬP</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/register" className="auth-tab">ĐĂNG KÝ</Nav.Link>
          </Nav.Item>
        </Nav>

        <Card.Body className="auth-body">
          <Form>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập email hoặc Tên đăng nhập"
              autoComplete="username"
            />

            <Form.Control
              className="auth-field"
              type="password"
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />

            <div className="auth-actions">
              <Button type="button" className="auth-primary-btn login">ĐĂNG NHẬP</Button>
            </div>

            <div className="auth-center-link">
              <a href="#">Quên mật khẩu?</a>
            </div>

            <div className="auth-divider">Hoặc đăng nhập với</div>

            <div className="auth-social-row">
              <Button type="button" className="auth-social-btn facebook">
                <span className="icon">f</span>
                <span className="label">Đăng nhập bằng Facebook</span>
              </Button>

              <Button type="button" className="auth-social-btn google">
                <span className="icon">G</span>
                <span className="label">Đăng nhập bằng Google</span>
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
