import { cartMock } from '../data/cartMock.js';

const clone = (value) => JSON.parse(JSON.stringify(value));

export async function getCartSnapshot() {
  // Goi API that khi backend cart endpoint san sang.
  return Promise.resolve(clone(cartMock));
}
