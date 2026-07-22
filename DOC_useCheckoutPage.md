# GIẢI THÍCH CHI TIẾT HOOK VÀ SERVICE CHECKOUT: useCheckoutPage.js & checkoutService.js & checkoutMath.js

- **Đường dẫn tương đối:** 
  - `frontend/src/features/checkout/hooks/useCheckoutPage.js`
  - `frontend/src/features/checkout/services/checkoutService.js`
  - `frontend/src/features/checkout/utils/checkoutMath.js`

---

## 1. `useCheckoutPage.js` (Custom Hook điều phối dữ liệu Checkout)
```javascript
export function useCheckoutPage() {
  // Lấy sessionId từ sessionStorage nếu trang được khôi phục
  const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('checkout_session_id'));

  // Sử dụng useQuery khởi tạo phiên giữ kho 15 phút từ Backend
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ['checkoutSession', sessionId],
    queryFn: async () => {
      const cartItemIds = JSON.parse(sessionStorage.getItem('checkout_selected_items') || '[]');
      const res = await api.post('/checkout/session/init', { cartItemIds });
      sessionStorage.setItem('checkout_session_id', res.data.sessionId);
      return res.data;
    },
    enabled: !sessionId,
    retry: false
  });

  // Tải danh sách Địa chỉ giao hàng & Phương thức vận chuyển
  const { data: addressesData } = useQuery({ queryKey: ['addresses'], queryFn: getAddressesAPI });
  const { data: shippingData } = useQuery({ queryKey: ['shippingMethods'], queryFn: getShippingMethodsAPI });

  return {
    loading: isSessionLoading,
    checkoutItems: sessionData?.items || [],
    sessionId: sessionData?.sessionId || sessionId,
    sessionExpiresAt: sessionData?.expiresAt,
    addresses: addressesData?.data || [],
    shippingMethods: shippingData?.data || []
  };
}
```

---

## 2. `checkoutService.js` (Tầng gọi API Checkout)
```javascript
import api from '../../../shared/services/axios.js';

export function getAddressesAPI() { return api.get('/addresses'); }
export function addAddressAPI(payload) { return api.post('/addresses', payload); }
export function getShippingMethodsAPI() { return api.get('/shipping-methods'); }
export function applyVoucherAPI(code) { return api.post('/vouchers/apply', { code }); }
```

---

## 3. `checkoutMath.js` (Tính toán tổng hóa đơn Checkout)
```javascript
export function getDiscountAmount({ voucher, itemsSubtotal, shippingFee }) {
  if (!voucher) return 0;
  if (voucher.type === 'PERCENTAGE') {
    return (itemsSubtotal * voucher.value) / 100;
  }
  return voucher.value;
}

export function getCartTotals({ itemsSubtotal, shippingFee, discountAmount }) {
  const total = Math.max(0, itemsSubtotal + shippingFee - discountAmount);
  return { itemsSubtotal, shippingFee, discountAmount, total };
}
```
