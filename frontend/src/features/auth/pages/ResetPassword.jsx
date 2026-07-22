import { useEffect, useState } from "react";
import { Card,Modal,Button,Form} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../service/apiAuth";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token,setToken] = useState("");
  const [showModal,setShowModal]=useState(false);
  const [errorRegister,setErrorRegister]=useState("");
  const [loadding,setLoadding] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() =>{
    if (location.state?.resetToken) {
      setToken(location.state?.resetToken);
    } else {
      navigate("/forgot-password");
    }
  },[location,navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorRegister({ message: "Mật khẩu không khớp" });
      return;
    }

    setLoadding(true);

    try {
      const result = await resetPassword({token,password });
      console.log(result);
      setShowModal(true);
      setLoadding(false);
    } catch (error) {
        console.log(error.response.data);
        setErrorRegister(error.response.data);
        setLoadding(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/login")
  }
  return (
    <div className="d-flex justify-content-center align-items-center vh-120">
      <Card style={{ width: "600px" }} className="p-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập mật khẩu mới"
              autoComplete="one-time-code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="one-time-code"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {errorRegister && <div className="error-text">{errorRegister.message}</div>}
            <div className="auth-actions">
              <button type="submit" className="btn btn-primary" disabled={loadding}>
                {loadding ? "Loadding....":"Verify"}
              </button>
            </div>
          </Form>
          {/* Modal thông báo change password Successful */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Change Password Successful</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <h5 className="mt-3 mb-2">Đổi mật khẩu thành công! Bạn có thể đăng nhập</h5>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button variant="primary" onClick={handleCloseModal}>
                Click here to login
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResetPassword;
