# GIẢI THÍCH CHI TIẾT CÁC FILE GIỎ HÀNG: CartExperience.jsx & useCartItems.js & cartService.js & cartMath.js

- **Đường dẫn tương đối:** 
  - `frontend/src/features/cart/components/CartExperience/CartExperience.jsx`
  - `frontend/src/features/cart/hooks/useCartItems.js`
  - `frontend/src/features/cart/services/cartService.js`
  - `frontend/src/features/cart/utils/cartMath.js`

---

## 1. `cartService.js` (Gọi API Axios)
```javascript
import api from '../../../shared/services/axios.js';

export async function getMyCartAPI() {
  return api.get('/carts/me'); // GET /api/v1/carts/me
}

export async function addItemAPI(payload) {
  return api.post('/carts/items', payload); // POST /api/v1/carts/items
}

export async function updateQuantityAPI(itemId, quantity) {
  return api.put(`/carts/items/${itemId}`, { quantity }); // PUT /api/v1/carts/items/{id}
}

export async function removeItemAPI(itemId) {
  return api.delete(`/carts/items/${itemId}`); // DELETE /api/v1/carts/items/{id}
}
```

---

## 2. `useCartItems.js` (Custom Hook quản lý state giỏ hàng)
```javascript
export function useCartItems() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getMyCartAPI();
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return { cart, loading, refreshCart: fetchCart };
}
```

---

## 3. `cartMath.js` (Tính toán tổng tiền)
```javascript
// Tính tổng tiền các mặt hàng được tick chọn trong giỏ hàng
export function getSelectedItemsSubtotal(cartItems, selectedItemIds) {
  if (!cartItems || !selectedItemIds) return 0;
  return cartItems
    .filter(item => selectedItemIds.includes(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
```

---

## 4. `CartExperience.jsx` (Giao diện trang Giỏ hàng `/cart`)
- Hiển thị danh sách các `CartItem`. Cho phép tăng/giảm số lượng hoặc xóa mặt hàng khỏi giỏ.
- Cho phép người dùng chọn Checkbox từng mặt hàng muốn mua.
- Khi bấm **"Tiến hành Thanh toán"**:
  ```javascript
  sessionStorage.setItem('checkout_selected_items', JSON.stringify(selectedIds));
  navigate('/checkout');
  ```
