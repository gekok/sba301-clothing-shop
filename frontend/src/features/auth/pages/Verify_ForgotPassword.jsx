import { useEffect, useState } from "react";
import { Card,Form} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../service/apiAuth";

const Verify_ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorRegister,setErrorRegister]=useState("");
  const [loadding,setLoadding] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() =>{
    if (location.state?.email) {
      setEmail(location.state?.email);
    } else {
      navigate("/forgot-password");
    }
  },[location,navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadding(true);
    try {
      const result = await verifyOtp({ email, otp });
      console.log(result);
      setLoadding(false);
      navigate("/reset-password", { state: { resetToken: result.token } });
    } catch (error) {
        console.log(error.response.data);
        setErrorRegister(error.response.data);
        setLoadding(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-110">
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default Verify_ForgotPassword;
