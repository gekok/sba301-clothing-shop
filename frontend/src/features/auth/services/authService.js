// Tầng gọi API cho đăng nhập/đăng ký.
import api from '../../../shared/services/axios.js';

const AUTH_URL = '/auth';

export async function login({ email, password }) {
  const res = await api.post(`${AUTH_URL}/login`, { email, password });
  return res.data;
}
