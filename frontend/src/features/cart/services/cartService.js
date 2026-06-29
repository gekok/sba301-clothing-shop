import api from '../../../shared/services/axios.js';
import { cartMock, voucherCatalog } from '../data/cartMock.js';

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
      addresses: res.data.addresses && res.data.addresses.length > 0 ? res.data.addresses : clone(cartMock.addresses),
      shippingMethods: clone(cartMock.shippingMethods),
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
    const res = await api.put(`/carts/items/${itemId}?quantity=${quantity}`);
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Lỗi cập nhật số lượng", err);
    throw err;
  }
}

export async function removeItemAPI(itemId) {
  try {
    await api.delete(`/carts/items/${itemId}`);
    return { success: true };
  } catch (err) {
    console.error("Lỗi xóa sản phẩm", err);
    throw err;
  }
}

export async function addAddressAPI(addressData) {
  await delay(300);
  return Promise.resolve({ success: true, data: { ...addressData, id: Date.now() } });
}

export async function clearUnavailableItemsAPI(itemIds) {
  await delay(300);
  return Promise.resolve({ success: true });
}

export async function applyVoucherAPI(code) {
  await delay(300);
  const matched = voucherCatalog?.[code] || null;
  if (!matched) throw new Error('Mã giảm giá không hợp lệ.');
  return Promise.resolve({ success: true, data: matched });
}

export async function checkoutAPI(checkoutPayload) {
  // handled in CheckoutLayout
  await delay(500);
  return Promise.resolve({ success: true, orderId: Date.now() });
}
