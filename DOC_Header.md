# GIẢI THÍCH CHI TIẾT FILE LAYOUT & ROUTER: Header.jsx & router/index.jsx

- **Đường dẫn tương đối:** 
  - `frontend/src/shared/components/Header.jsx`
  - `frontend/src/app/router/index.jsx`

---

## 1. `Header.jsx` (Lắng nghe sự kiện nhảy số Giỏ hàng)
```javascript
// Bổ sung đường dẫn "Đơn hàng của tôi" vào Menu User
const account = [
  { label: 'Thông tin cá nhân', to: '/account' },
  { label: 'Đơn hàng của tôi', to: '/my-orders' },
  { label: 'Sổ địa chỉ', to: '/account/addresses' },
];

// Lắng nghe sự kiện custom cartUpdated
useEffect(() => {
  let mounted = true;
  const syncCartCount = () => {
    getCartCount().then((count) => {
      if (mounted) setCartCount(count);
    });
  };

  syncCartCount();
  window.addEventListener('cartUpdated', syncCartCount);
  return () => {
    mounted = false;
    window.removeEventListener('cartUpdated', syncCartCount);
  };
}, []);
```

---

## 2. `router/index.jsx` (Khai báo định tuyến React Router)
```javascript
const teamFeatureRoutes = [
  { path: 'products/:id', element: <CustomerProductDetail /> }, // Chi tiết sản phẩm khách mua
  { path: 'cart', element: <CartExperience /> },                 // Trang giỏ hàng
  { path: 'checkout', element: <CheckoutLayout /> },             // Trang checkout
  { path: 'checkout/vnpay-return', element: <VNPayReturn /> },  // Callback VNPAY
  { path: 'my-orders', element: <MyOrders /> },                 // Trang danh sách đơn hàng
];
```
