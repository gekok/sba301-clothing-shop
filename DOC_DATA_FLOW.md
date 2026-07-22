# SƠ ĐỒ VÀ LUỒNG ĐI CỦA DỮ LIỆU (DATA FLOW DIAGRAM & SEQUENCES)

Tài liệu này mô tả chi tiết từng bước di chuyển của dữ liệu từ khi Người dùng thực hiện thao tác trên giao diện Frontend (ReactJS), qua tầng REST API Controller, xuống tầng Nghiệp vụ Service, truy vấn CSDL qua Repository và lưu trữ tại SQL Server.

---

## THAO TÁC 1: XEM VÀ THÊM SẢN PHẨM VÀO GIỎ HÀNG (ADD TO CART)

### Sơ đồ luồng di chuyển dữ liệu:
```
[User trên Browser]
       │ 1. Chọn Size/Màu & Bấm "Thêm vào giỏ"
       ▼
[CustomerProductDetail.jsx]
       │ 2. Gọi addItemAPI({ variantId: 10, quantity: 2 })
       ▼
[CartController.java (POST /api/v1/carts/items)]
       │ 3. Gọi cartService.addItem(request)
       ▼
[CartServiceImpl.java]
       │ 4. Lấy currentUser từ SecurityContextHolder
       │ 5. Kiểm tra stockQuantity khả dụng trong ProductVariant
       │ 6. Thêm/Cộng dồn CartItem vào Cart
       ▼
[CartRepository & CartItemRepository]
       │ 7. Thực thi SQL INSERT/UPDATE vào bảng `carts` & `cart_items`
       ▼
[SQL Server Database]
       │ 8. Trả về CartItemResponse
       ▼
[CustomerProductDetail.jsx]
       │ 9. Hiển thị Toast "Đã thêm vào giỏ hàng!"
       │ 10. dispatchEvent('cartUpdated') -> Header.jsx tự nhảy số Badge
```

---

## THAO TÁC 2: MỞ GIỎ HÀNG VÀ TICK CHỌN HÀNG ĐỂ THANH TOÁN

### Sơ đồ luồng di chuyển dữ liệu:
```
[User chuyển sang trang /cart]
       │ 1. Mount Component
       ▼
[CartExperience.jsx]
       │ 2. Gọi getMyCartAPI() (GET /api/v1/carts/me)
       ▼
[CartController.java -> CartServiceImpl.java]
       │ 3. Tìm Cart theo currentUser.getId() trong CSDL SQL Server
       ▼
[CartExperience.jsx]
       │ 4. Render danh sách sản phẩm, cho phép tăng/giảm số lượng (PUT /carts/items/{id})
       │ 5. Khách tick chọn mảng item IDs muốn mua -> Lưu vào sessionStorage ('checkout_selected_items')
       │ 6. Bấm "Tiến hành thanh toán" -> Chuyển hướng sang /checkout
```

---

## THAO TÁC 3: CHECKOUT, KHÓA KHO 15 PHÚT VÀ THANH TOÁN VNPAY

### Sơ đồ luồng di chuyển dữ liệu:
```
[User vào trang /checkout]
       │ 1. Đọc cartItemIds từ sessionStorage -> Gọi initSession()
       ▼
[CheckoutSessionController.java (POST /api/v1/checkout/session/init)]
       │ 2. Gọi CheckoutSessionService.initSession()
       ▼
[CheckoutSessionService.java]
       │ 3. TẠM TRỪ KHO HÀNG: variant.stockQuantity = stockQuantity - qty
       │ 4. Tạo bản ghi InventoryReservation với sessionId (UUID) & expiresAt (15 phút)
       ▼
[CheckoutLayout.jsx]
       │ 5. Bắt đầu đếm ngược 15 phút & Kích hoạt useBlocker (Chặn thoát trang)
       │ 6. Khách chọn VNPAY & Bấm "Đặt hàng" (POST /api/v1/orders)
       ▼
[OrderServiceImpl.java]
       │ 7. Tạo Đơn Order (PENDING, UNPAID), xóa CartItem & xóa Reservation
       │ 8. Gọi VNPayConfig.getPaymentUrl() sinh URL băm SHA-512 VNPAY
       ▼
[Cổng Thanh Toán VNPAY]
       │ 9. Khách thực hiện thanh toán trên cổng VNPAY
       │ 10. VNPAY chuyển hướng về /checkout/vnpay-return?vnp_ResponseCode=00
       ▼
[VNPayReturn.jsx]
       │ 11. Dọn dẹp sessionStorage('checkout_session_id')
       │ 12. Gọi /api/v1/orders/vnpay-callback xác thực chữ ký
       ▼
[OrderServiceImpl.java]
       │ 13. Nếu mã "00" -> Order = CONFIRMED, Payment = PAID
       │ 14. Nếu hủy -> Order = CANCELLED, CỘNG TRẢ LẠI KHO HÀNG
```

---

## THAO TÁC 4: XEM LỊCH SỬ ĐƠN HÀNG CỦA TÔI (MY ORDERS)

### Sơ đồ luồng di chuyển dữ liệu:
```
[User bấm "Đơn hàng của tôi"]
       │ 1. Chuyển hướng /my-orders
       ▼
[MyOrders.jsx]
       │ 2. Gọi API GET /api/v1/orders/me
       ▼
[OrderController.java -> OrderServiceImpl.java]
       │ 3. Lấy toàn bộ đơn hàng theo currentUser.getId() từ SQL Server (xếp giảm dần theo ngày)
       ▼
[MyOrders.jsx]
       │ 4. Hiển thị danh sách thẻ đơn hàng, cho phép bấm các Tab lọc (PENDING, CONFIRMED, CANCELLED...)
       │ 5. Khách bấm "Xem chi tiết" -> Mở OrderDetailModal.jsx xem đầy đủ từng sản phẩm và tổng giá tiền
```
