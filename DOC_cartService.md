# GIẢI THÍCH CHI TIẾT FILE SERVICE: cartService.js & cartMath.js

- **Đường dẫn tương đối:** 
  - `frontend/src/features/cart/services/cartService.js`
  - `frontend/src/features/cart/utils/cartMath.js`

---

## 1. `cartService.js` (Tầng giao tiếp REST API)
```javascript
import api from '../../../shared/services/axios.js';

// Gọi API GET /api/v1/carts/me
export async function getMyCartAPI() {
  return api.get('/carts/me');
}

// Gọi API POST /api/v1/carts/items gửi { variantId, quantity }
export async function addItemAPI(itemPayload) {
  return api.post('/carts/items', itemPayload);
}

// Gọi API PUT /api/v1/carts/items/{itemId}
export async function updateQuantityAPI(itemId, quantity) {
  return api.put(`/carts/items/${itemId}`, { quantity });
}

// Gọi API DELETE /api/v1/carts/items/{itemId}
export async function removeItemAPI(itemId) {
  return api.delete(`/carts/items/${itemId}`);
}
```

---

## 2. `cartMath.js` (Tầng tính toán số liệu)
```javascript
// Tính tổng thành tiền của mảng các cartItems
export function getItemsSubtotal(items = []) {
  return items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
}

// Lọc và tính tổng tiền của các sản phẩm được tick chọn Checkbox để chuẩn bị thanh toán
export function getSelectedItemsSubtotal(items = [], selectedIds = []) {
  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  return getItemsSubtotal(selectedItems);
}
```
