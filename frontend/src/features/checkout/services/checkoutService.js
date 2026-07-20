import { voucherCatalog, addressesMock, shippingMethodsMock } from '../data/checkoutMock.js';

// Giả lập độ trễ mạng
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function addAddressAPI(addressData) {
  await delay(300);
  return Promise.resolve({ success: true, data: { ...addressData, id: Date.now() } });
}

export async function applyVoucherAPI(code) {
  await delay(300);
  const matched = voucherCatalog?.[code] || null;
  if (!matched) throw new Error('Mã giảm giá không hợp lệ.');
  return Promise.resolve({ success: true, data: matched });
}

export async function getAddressesAPI() {
  await delay(300);
  return Promise.resolve({ success: true, data: addressesMock });
}

export async function getShippingMethodsAPI() {
  await delay(300);
  return Promise.resolve({ success: true, data: shippingMethodsMock });
}
