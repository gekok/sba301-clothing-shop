import api from '../../../shared/services/axios';

// Gói toàn bộ call API giỏ hàng — Cart.jsx gọi qua đây thay vì dùng axios trực tiếp.
// Mỗi hàm trả về promise của axios để call site giữ nguyên (await + res.data).
const cartService = {
  getMyCart: () => api.get('/carts/me'),
  updateItem: (id, quantity) => api.put(`/carts/items/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/carts/items/${id}`),
};

export default cartService;
