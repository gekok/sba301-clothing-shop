// Tầng gọi API cho màn quản lý đơn hàng (admin).
// Component không tự gọi axios -> sau này đổi endpoint chỉ sửa đúng file này.
import api from '../../../shared/services/axios.js';

// baseURL đã là http://localhost:8080/api/v1 (shared/services/axios.js)
// nên ở đây chỉ viết phần đuôi.
const ADMIN_ORDER_URL = '/admin/orders';

// Tham số nào để undefined thì axios bỏ luôn khỏi query string,
// backend nhận null = không lọc theo tiêu chí đó.
export async function getOrders({ status, channel, keyword } = {}) {
  const res = await api.get(ADMIN_ORDER_URL, {
    params: {
      status: status && status !== 'ALL' ? status : undefined,
      channel: channel && channel !== 'ALL' ? channel : undefined,
      keyword: keyword && keyword.trim() ? keyword.trim() : undefined,
    },
  });
  return res.data;
}

// Trả về đơn SAU khi server đã đổi trạng thái, không phải thứ client đoán trước.
export async function updateOrderStatus(id, status) {
  const res = await api.put(`${ADMIN_ORDER_URL}/${id}/status`, { status });
  return res.data;
}
