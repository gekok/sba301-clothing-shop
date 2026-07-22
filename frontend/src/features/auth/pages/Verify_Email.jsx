import { useEffect, useState } from "react";
import { Card,Modal,Button,Form} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyEmail } from "../service/apiAuth";

const Verify_Email = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showModal,setShowModal]=useState(false);
  const [errorRegister,setErrorRegister]=useState("");
  const [loadding,setLoadding] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() =>{
    if (location.state?.email) {
      setEmail(location.state?.email);
    } else {
      navigate("/register");
    }
  },[location,navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadding(true);
    try {
      const result = await verifyEmail({ email, otp });
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
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "600px" }} className="p-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="auth-field"
              type="text"
              placeholder="Nhập mã xác nhận"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {errorRegister && <div className="error-text">{errorRegister.message}</div>}
            <div className="auth-actions">
              <button type="submit" className="btn btn-primary" disabled={loadding}>
                {loadding ? "Loadding....":"Verify"}
              </button>
            </div>
          </Form>
          {/* Modal thông báo Register Successful */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Verify Successful</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <h5 className="mt-3 mb-2">Đăng ký thành công!Bạn có thể đăng nhập</h5>
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

export default Verify_Email;
