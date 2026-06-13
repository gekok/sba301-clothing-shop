import { Link } from 'react-router-dom';
import { Button, Card, Form, Nav } from 'react-bootstrap';
import './AuthPages.css';

export default function Register() {
  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <Nav className="auth-tabs">
          <Nav.Item>
            <Nav.Link as={Link} to="/login" className="auth-tab">ĐĂNG NHẬP</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/register" className="auth-tab active">ĐĂNG KÝ</Nav.Link>
          </Nav.Item>
        </Nav>

        <Card.Body className="auth-body">
          <Form>
            <Form.Control className="auth-field" type="text" placeholder="Họ tên" autoComplete="name" />
            <Form.Control className="auth-field" type="tel" placeholder="Điện thoại" autoComplete="tel" />
            <Form.Control className="auth-field" type="email" placeholder="Email" autoComplete="email" />
            <Form.Control
              className="auth-field"
              type="password"
              placeholder="Mật khẩu của bạn"
              autoComplete="new-password"
            />

            <div className="auth-actions">
              <Button type="button" className="auth-primary-btn register">ĐĂNG KÝ</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
