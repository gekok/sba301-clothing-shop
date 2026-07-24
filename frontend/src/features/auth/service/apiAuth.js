import api from "../../../shared/services/axios";

// LOGIN
export const loginApi = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// REGISTER
export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

//Verify_Email
export const verifyEmail = async (data) =>{
  const response = await api.post("/auth/verification",data);
  return response.data;
}

// GET CURRENT USER
export const getMe = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

// LOGOUT (nếu backend có)
export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};


export const refreshToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

// FORGOT PASSWORD (send reset otp to email)
export const forgotPassword = async (data) => {
  const response = await api.post("/auth/forgot-password", data );
  return response.data;
};

// RESET PASSWORD (with token from email link)
export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

// VERIFY OTP (for forgot password)
export const verifyOtp = async (data) => {
  const response = await api.post("/auth/verify-otp", data);
  return response.data;
};