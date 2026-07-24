import axios from 'axios';
import {refreshToken} from '../../features/auth/service/apiAuth';
// Base URL đọc từ Vite env (file .env / .env.local). Fallback localhost cho dev.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true, // gửi kèm cookie HttpOnly "refreshToken" cho /auth/refresh-token
  headers: {
    'Content-Type': 'application/json',
  },
});

// Đính JWT token vào header nếu đã login.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: runs after every reply arrives
api.interceptors.response.use(
  function (response) {
    return response; // pass a good response straight through
  },
  async function (error) {
    const originalConfig = error.config;

    if (error.response) {
      console.log("Error response:", error.response.status, originalConfig.url);
    }

    // Request refresh-token TỰ NÓ bị 401 (cookie refreshToken thiếu/hết hạn) không được
    // đi vào nhánh retry bên dưới, nếu không sẽ gọi lại refreshToken() vô hạn (request mới
    // luôn có _retry=false, tự kích hoạt lại chính interceptor này).
    if (
      error.response &&
      error.response.status === 401 &&
      !originalConfig._retry &&
      !originalConfig.url?.includes('/auth/refresh-token')
    ) {
      originalConfig._retry = true; // Đánh dấu đã retry

      try {
        console.log("Session expired. Attempting to refresh token...");

        const data = await refreshToken();
        const newAccessToken = data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        // Thực hiện lại request ban đầu với session (cookie) mới
        return api(originalConfig);
      } catch (_error) {
        console.error("Refresh token failed, logging out...", _error);
        // Nếu refresh token cũng hết hạn hoặc lỗi -> Xoá session và đẩy về login
        localStorage.removeItem("accessToken");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(_error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
