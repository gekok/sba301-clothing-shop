import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { Button, Card, Form, Nav,Modal } from "react-bootstrap";
import "./AuthPages.css";
import { register } from "../service/apiAuth";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorRegister,setErrorRegister]=useState("");
  const [loadding,setLoadding]=useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadding(true);
    console.log(loadding);

    try {
      const result = await register({ email, password, fullName, phone });
      console.log(result);
      setShowModal(true);
      setLoadding(false);
    } catch (error) {
      console.log(error.response.data);
      setErrorRegister(error.response.data);
      setLoadding(false);
    }
  };

  const handleCloseModal = () =>{
    setShowModal(false);
    navigate("/verify-email",{
      state:{
        email:email
      }
    })
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <Nav className="auth-tabs">
          <Nav.Item>
            <Nav.Link as={Link} to="/login" className="auth-tab">
              ĐĂNG NHẬP
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/register" className="auth-tab active">
              ĐĂNG KÝ
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Card.Body className="auth-body">
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Họ tên"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Form.Control
              className="auth-field"
              type="tel"
              placeholder="Điện thoại"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Form.Control
              className="auth-field"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Form.Control
              className="auth-field"
              type="password"
              placeholder="Mật khẩu của bạn"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errorRegister && (<div className="error-text" >{errorRegister.message}</div>)}
            <div className="auth-actions">
              <Button type="submit" className="auth-primary-btn register"  disabled={loadding}>
                {loadding ? "loading..." : "ĐĂNG KÝ"}
              </Button>
            </div>
          </Form>
          {/* Modal thông báo Register Successful */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Register Successful</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <h5 className="mt-3 mb-2">Đăng ký thành công!</h5>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button variant="primary" onClick={handleCloseModal}>
                Click here to verify email
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
}
