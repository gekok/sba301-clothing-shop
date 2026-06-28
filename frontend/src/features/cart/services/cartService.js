import { cartMock, voucherCatalog } from '../data/cartMock.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

// Giả lập độ trễ mạng
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCartSnapshot() {
  // Goi API that khi backend cart endpoint san sang.
  await delay(300);
  return Promise.resolve(clone(cartMock));
}

// ------------------------------------------------------------------
// CÁC HÀM GỌI API MÔ PHỎNG (Sẽ thay bằng axios khi có Backend thật)
// ------------------------------------------------------------------

export async function addItemAPI(itemPayload) {
  // Thực tế: return await axios.post('/api/cart/items', itemPayload);
  await delay(300);
  return Promise.resolve({ success: true, data: itemPayload });
}

export async function updateQuantityAPI(itemId, quantity) {
  // Thực tế: return await axios.put(`/api/cart/items/${itemId}`, { quantity });
  await delay(300);
  return Promise.resolve({ success: true, data: { itemId, quantity } });
}

export async function removeItemAPI(itemId) {
  // Thực tế: return await axios.delete(`/api/cart/items/${itemId}`);
  await delay(300);
  return Promise.resolve({ success: true });
}

export async function addAddressAPI(addressData) {
  // Thực tế: return await axios.post('/api/cart/addresses', addressData);
  await delay(300);
  return Promise.resolve({ success: true, data: { ...addressData, id: Date.now() } });
}

export async function clearUnavailableItemsAPI(itemIds) {
  // Thực tế: return await axios.post('/api/cart/items/clear-unavailable', { itemIds });
  await delay(300);
  return Promise.resolve({ success: true });
}

export async function applyVoucherAPI(code) {
  // Thực tế: return await axios.post('/api/cart/vouchers/apply', { code });
  await delay(300);
  const matched = voucherCatalog?.[code] || null;
  if (!matched) throw new Error('Mã giảm giá không hợp lệ.');
  return Promise.resolve({ success: true, data: matched });
}

export async function checkoutAPI(checkoutPayload) {
  // Thực tế: return await axios.post('/api/cart/checkout', checkoutPayload);
  await delay(500);
  return Promise.resolve({ success: true, orderId: Date.now() });
}
