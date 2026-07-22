# GIẢI THÍCH CHI TIẾT CÁC FILE THANH TOÁN: CheckoutLayout.jsx & useCheckoutPage.js & VNPayReturn.jsx

- **Đường dẫn tương đối:** 
  - `frontend/src/features/checkout/components/CheckoutLayout.jsx`
  - `frontend/src/features/checkout/hooks/useCheckoutPage.js`
  - `frontend/src/features/checkout/services/checkoutService.js`
  - `frontend/src/features/checkout/components/VNPayReturn.jsx`

---

## 1. `useCheckoutPage.js` (Khởi tạo phiên giữ kho 15 phút)
```javascript
// Đọc sessionId từ sessionStorage nếu đã tạo trước đó
const [sessionId, setSessionId] = useState(() => sessionStorage.getItem('checkout_session_id'));

// Gọi API POST /checkout/session/init
const { data: sessionData, isLoading } = useQuery({
  queryKey: ['checkoutSession', sessionId],
  queryFn: async () => {
    const cartItemIds = JSON.parse(sessionStorage.getItem('checkout_selected_items') || '[]');
    const res = await api.post('/checkout/session/init', { cartItemIds });
    sessionStorage.setItem('checkout_session_id', res.data.sessionId);
    return res.data;
  },
  enabled: !sessionId
});
```

---

## 2. `CheckoutLayout.jsx` (Chặn rời trang `useBlocker`)
```javascript
// Chặn người dùng vô tình bấm Back hoặc chuyển trang khi đang giữ kho 15 phút
let blocker = useBlocker(
  ({ currentLocation, nextLocation }) => {
    if (isOrderCompleted) return false; // Đã tạo đơn thành công -> Cho qua
    if (currentLocation.pathname !== nextLocation.pathname && !isSessionExpired && sessionId) {
      return true; // Ngược lại -> Chặn lại và mở Modal xác nhận rời đi
    }
    return false;
  }
);

// Xử lý gửi đơn hàng
const handlePlaceOrder = async () => {
  const res = await api.post('/orders', { sessionId, paymentMethod: selectedPaymentMethod, ... });
  
  if (selectedPaymentMethod === 'VNPAY' && res.data.paymentUrl) {
    sessionStorage.removeItem('checkout_selected_items');
    setIsOrderCompleted(true);
    window.location.href = res.data.paymentUrl; // Chuyển sang VNPAY
  } else {
    // Thanh toán COD -> Hiện Modal Thành công
    setIsOrderCompleted(true);
    setShowSuccessModal(true);
  }
};
```

---

## 3. `VNPayReturn.jsx` (Xử lý Callback VNPAY)
```javascript
useEffect(() => {
  const verifyPayment = async () => {
    // Dọn dẹp sessionId để tránh lỗi gọi lại phiên cũ đã hủy
    sessionStorage.removeItem('checkout_session_id');

    // Chuyển query URL (?vnp_ResponseCode=00...) thành JSON
    const params = {};
    searchParams.forEach((val, key) => { params[key] = val; });

    // Gọi API Backend /orders/vnpay-callback xác thực chữ ký HmacSHA512
    const response = await api.get('/orders/vnpay-callback', { params });

    if (searchParams.get('vnp_ResponseCode') === '00') {
      setSuccess(true); // Hiển thị Đã thanh toán thành công
    } else {
      setSuccess(false); // Hiển thị Thanh toán thất bại/bị hủy
    }
  };

  verifyPayment();
}, [searchParams]);
```
