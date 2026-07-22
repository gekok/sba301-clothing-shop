# GIẢI THÍCH CHI TIẾT CÁC FILE LỊCH SỬ ĐƠN HÀNG VÀ BỐ CỤC CHUNG: MyOrders.jsx & OrderDetailModal.jsx & Header.jsx & router/index.jsx

- **Đường dẫn tương đối:** 
  - `frontend/src/features/orders/pages/MyOrders.jsx`
  - `frontend/src/features/orders/components/OrderDetailModal.jsx`
  - `frontend/src/shared/components/Header.jsx`
  - `frontend/src/app/router/index.jsx`

---

## 1. `MyOrders.jsx` (Trang xem lịch sử đơn hàng `/my-orders`)
```javascript
// Gọi API lấy danh sách đơn hàng cá nhân
const fetchMyOrders = async () => {
  const res = await api.get('/orders/me'); // GET /api/v1/orders/me
  setOrders(res.data || []);
};

// Lọc danh sách đơn hàng theo Tab được chọn (ALL, PENDING, CONFIRMED, CANCELLED)
const filteredOrders = useMemo(() => {
  if (activeTab === 'ALL') return orders;
  return orders.filter(o => o.status === activeTab);
}, [orders, activeTab]);

// Mở Modal chi tiết đơn hàng
const handleOpenDetail = (order) => {
  setSelectedOrder(order);
  setShowModal(true);
};
```

---

## 2. `OrderDetailModal.jsx` (Modal xem chi tiết đơn)
- Nhận prop `order` từ `MyOrders.jsx`.
- Sử dụng `Table` render danh sách `order.items` (tên sản phẩm, size/màu, đơn giá, số lượng, thành tiền).
- Hiển thị thông tin tổng tiền, phí vận chuyển và trạng thái đơn hàng (Badge màu sắc).

---

## 3. `Header.jsx` (Lắng nghe sự kiện Giỏ hàng & Menu Tài khoản)
```javascript
// Thêm mục "Đơn hàng của tôi" vào menu dropdown tài khoản
const account = [
  { label: 'Thông tin cá nhân', to: '/account' },
  { label: 'Đơn hàng của tôi', to: '/my-orders' },
  { label: 'Sổ địa chỉ', to: '/account/addresses' },
];

// Lắng nghe sự kiện cartUpdated từ CustomerProductDetail.jsx để nhảy số giỏ hàng trên Badge
useEffect(() => {
  const syncCartCount = () => { getCartCount().then(setCartCount); };
  window.addEventListener('cartUpdated', syncCartCount);
  return () => window.removeEventListener('cartUpdated', syncCartCount);
}, []);
```

---

## 4. `router/index.jsx` (Định tuyến Route)
```javascript
const teamFeatureRoutes = [
  { path: 'products/:id', element: <CustomerProductDetail /> }, // Chi tiết sản phẩm khách mua
  { path: 'cart', element: <CartExperience /> },                 // Trang giỏ hàng
  { path: 'checkout', element: <CheckoutLayout /> },             // Trang checkout
  { path: 'checkout/vnpay-return', element: <VNPayReturn /> },  // Callback VNPAY
  { path: 'my-orders', element: <MyOrders /> },                 // Lịch sử đơn hàng
];
```
