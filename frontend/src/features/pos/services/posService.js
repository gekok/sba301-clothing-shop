// Tầng gọi API cho màn bán hàng tại quầy (POS).
import api from '../../../shared/services/axios.js';

const POS_URL = '/pos';

// Lấy toàn bộ biến thể (size/màu cụ thể) đang bán, kèm tồn kho.
// Không có tham số lọc: màn POS tải 1 lần rồi lọc tại chỗ để nhân viên đứng quầy
// gõ tới đâu thấy tới đó, không phải chờ mạng.
export async function getPosVariants() {
  const res = await api.get(`${POS_URL}/variants`);
  return res.data;
}

// payload: { items: [{ variantId, quantity }], customerName, note, paymentMethod }
// Trả về đơn vừa tạo để in hoá đơn.
export async function createPosOrder(payload) {
  const res = await api.post(`${POS_URL}/orders`, payload);
  return res.data;
}
