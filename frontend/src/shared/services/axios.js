import axios from 'axios';

// Base URL đọc từ Vite env (file .env / .env.local). Fallback localhost cho dev.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL,
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

// Bắt 401 → clear token + redirect login (tuỳ team cài route /login sau).
// Chỉ coi đây là "phiên hết hạn" (và bắn auth:logout) nếu request TRƯỚC ĐÓ thực sự
// có mang access token. Nếu không có token sẵn (khách chưa đăng nhập), 401 là
// hành vi bình thường của các endpoint cần auth (vd /carts/me) — không nên
// force-logout/redirect một người chưa từng đăng nhập.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const hadToken = Boolean(localStorage.getItem('accessToken'));

    if (err.response?.status === 401 && hadToken) {
      localStorage.removeItem('accessToken');
      // window.location.href = '/login';
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  },
);

export default api;
