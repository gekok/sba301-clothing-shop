import api from '../../../shared/services/axios.js';
import { voucherCatalog, shippingMethodsMock } from '../data/checkoutMock.js';

export async function addAddressAPI(addressData) {
  const res = await api.post('/addresses', addressData);
  return res;
}

export async function applyVoucherAPI(code) {
  const matched = voucherCatalog?.[code] || null;
  if (!matched) throw new Error('Mã giảm giá không hợp lệ.');
  return Promise.resolve({ success: true, data: matched });
}

export async function getAddressesAPI() {
  const res = await api.get('/addresses');
  return res;
}

export async function getShippingMethodsAPI() {
  return Promise.resolve({ success: true, data: shippingMethodsMock });
}
