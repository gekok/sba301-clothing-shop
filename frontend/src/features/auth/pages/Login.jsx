import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Nav, Spinner } from "react-bootstrap";
import { login } from "../services/authService.js";
import { setAuthState } from "../../../shared/utils/auth.js";
import "./AuthPages.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await login({ email, password });
      setAuthState({ accessToken: res.accessToken, role: res.role, email: res.email });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <Nav className="auth-tabs">
          <Nav.Item>
            <Nav.Link as={Link} to="/login" className="auth-tab active">
              ĐĂNG NHẬP
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/register" className="auth-tab">
              ĐĂNG KÝ
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Card.Body className="auth-body">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập email hoặc Tên đăng nhập"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Form.Control
              className="auth-field"
              type="password"
              placeholder="Mật khẩu"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="auth-actions">
              <Button type="submit" className="auth-primary-btn login" disabled={submitting}>
                {submitting ? <Spinner animation="border" size="sm" /> : "ĐĂNG NHẬP"}
              </Button>
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
