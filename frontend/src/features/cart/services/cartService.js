import api from '../../../shared/services/axios.js';
import { cartMock } from '../data/cartMock.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

// Giả lập độ trễ mạng
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCartSnapshot() {
  try {
    const res = await api.get('/carts/me');
    const backendItems = res.data.items.map(item => {
      const parts = item.variantInfo ? item.variantInfo.split(' / ') : [];
      return {
        ...item,
        size: parts[0] || 'N/A',
        color: parts[1] || 'N/A',
        isActive: item.stockQuantity > 0
      };
    });

    return {
      cartId: res.data.id,
      userId: 1, // mock
      channel: 'ONLINE',
      items: backendItems
    };
  } catch (error) {
    console.error("Lỗi tải giỏ hàng từ server, dùng mock fallback", error);
    await delay(300);
    return clone(cartMock);
  }
}

// ------------------------------------------------------------------
// CÁC HÀM GỌI API THỰC TẾ & MÔ PHỎNG (Sẽ thay bằng axios hoàn toàn khi có Backend)
// ------------------------------------------------------------------

export async function addItemAPI(itemPayload) {
  // Currently unused by real UI
  await delay(300);
  return Promise.resolve({ success: true, data: itemPayload });
}

export async function updateQuantityAPI(itemId, quantity) {
  try {
    const res = await api.put(`/carts/items/${itemId}`, { quantity });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Lỗi cập nhật số lượng, dùng mock fallback", err);
    await delay(300);
    return { success: true, data: { itemId, quantity } };
  }
}

export async function removeItemAPI(itemId) {
  try {
    await api.delete(`/carts/items/${itemId}`);
    return { success: true };
  } catch (err) {
    console.error("Lỗi xóa sản phẩm, dùng mock fallback", err);
    await delay(300);
    return { success: true };
  }
}



export async function clearUnavailableItemsAPI(itemIds) {
  await delay(300);
  return Promise.resolve({ success: true });
}



