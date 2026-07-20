import { MOCK_PRODUCTS } from '../../../shared/mock/products.js';

export const getFeaturedProducts = (limit = 3) => MOCK_PRODUCTS.slice(0, limit);