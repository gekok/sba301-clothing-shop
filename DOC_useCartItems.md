# GIẢI THÍCH CHI TIẾT HOOK: useCartItems.js

- **Đường dẫn tương đối:** `frontend/src/features/cart/hooks/useCartItems.js`
- **Chức năng:** Custom Hook xử lý trạng thái (State) và cung cấp các hàm thao tác giỏ hàng cho Component `CartExperience.jsx`.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```javascript
import { useState, useEffect } from 'react';
import { getMyCartAPI, addItemAPI, updateQuantityAPI, removeItemAPI } from '../services/cartService.js';

export function useCartItems() {
  const [cart, setCart] = useState(null); // Lưu thông tin giỏ hàng từ Backend
  const [loading, setLoading] = useState(true); // Trạng thái đang tải dữ liệu

  // Hàm gọi API lấy giỏ hàng mới nhất từ server
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getMyCartAPI();
      setCart(res.data);
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Hàm thêm sản phẩm
  const addItem = async (newItem) => {
    await addItemAPI(newItem);
    await fetchCart();
    window.dispatchEvent(new Event('cartUpdated')); // Bắn sự kiện cập nhật Header badge
  };

  // Hàm sửa số lượng
  const updateQuantity = async (itemId, quantity) => {
    await updateQuantityAPI(itemId, quantity);
    await fetchCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const removeItem = async (itemId) => {
    await removeItemAPI(itemId);
    await fetchCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return { cart, loading, addItem, updateQuantity, removeItem, refreshCart: fetchCart };
}
```
