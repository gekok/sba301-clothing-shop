import { useState } from "react";
import { Card,Modal,Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../service/apiAuth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [showModal,setShowModal]=useState(false);
  const [errorRegister,setErrorRegister]=useState("");
  const [loadding,setLoadding] = useState(false);

  
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadding(true);
    try {
      const result = await forgotPassword({ email });
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
    navigate("/verify-forgot-password", { state: { email } });
  }
  return (
    <div className="d-flex justify-content-center align-items-center vh-120">
      <Card style={{ width: "600px" }} className="p-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập email xác nhận"
              autoComplete="one-time-code"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errorRegister && <div className="error-text">{errorRegister.message}</div>}
            <div className="auth-actions">
              <button type="submit" className="btn btn-primary" disabled={loadding}>
                {loadding ? "Loadding....":"Submit"}
              </button>
            </div>
          </Form>
          {/* Modal thông báo Register Successful */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Submit Email Completed</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <h5 className="mt-3 mb-2">Vui lòng kiểm tra email </h5>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button variant="primary" onClick={handleCloseModal}>
                Click here to Verify Otp
              </Button>
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPassword;
