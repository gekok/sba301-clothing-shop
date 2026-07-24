import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form, Nav } from "react-bootstrap";
import "./AuthPages.css";
import { useAuth } from "../../../app/provider/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [loadding, setLoadding] = useState("");

  const navigate = useNavigate();
  const {login} = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadding(true);

    try {
      const me = await login({ email, password });
      console.log(me);
      setLoadding(false);

      if (me.roles === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (me.roles == "STAFF") {
        navigate("/staff/pos");
      }else {
        navigate("/products");
      }
    } catch (error) {
      setLoadding(false);
      setErrorLogin(error);
      console.log(error);
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
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập email hoặc Tên đăng nhập"
              autoComplete="email"
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

            {errorLogin && (
              <div className="auth-error">{errorLogin.message}</div>
            )}
            <div className="auth-actions">
              <Button
                type="submit"
                className="auth-primary-btn login"
                disabled={loadding}
              >
                {loadding ? "Loadding..." : "ĐĂNG NHẬP"}
              </Button>
            </div>

            <div className="auth-center-link">
              <a href="/forgot-password">Quên mật khẩu?</a>
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
