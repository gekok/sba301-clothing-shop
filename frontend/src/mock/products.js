// src/mock/products.js
// Sản phẩm + biến thể (variant) cho màn POS chọn hàng.
// Cấu trúc lồng nhau giống thật: 1 Product có nhiều ProductVariant.
// variant bám đúng entity ProductVariant: id, sku, size, color, price, stockQuantity.

export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Áo thun cotton',
    category: 'Áo',
    variants: [
      { id: 11, sku: 'AT-CT-M-WHITE', size: 'M', color: 'Trắng', price: 175000, stockQuantity: 25 },
      { id: 12, sku: 'AT-CT-L-BLACK', size: 'L', color: 'Đen', price: 220000, stockQuantity: 12 },
      { id: 13, sku: 'AT-CT-S-WHITE', size: 'S', color: 'Trắng', price: 175000, stockQuantity: 0 },
    ],
  },
  {
    id: 2,
    name: 'Quần jeans slim',
    category: 'Quần',
    variants: [
      { id: 21, sku: 'QJ-SL-30-NAVY', size: '30', color: 'Xanh đậm', price: 320000, stockQuantity: 8 },
      { id: 22, sku: 'QJ-SL-32-NAVY', size: '32', color: 'Xanh đậm', price: 320000, stockQuantity: 5 },
    ],
  },
  {
    id: 3,
    name: 'Áo khoác gió',
    category: 'Áo khoác',
    variants: [
      { id: 31, sku: 'AK-GO-M-GRAY', size: 'M', color: 'Xám', price: 450000, stockQuantity: 10 },
      { id: 32, sku: 'AK-GO-L-GRAY', size: 'L', color: 'Xám', price: 450000, stockQuantity: 3 },
    ],
  },
];
