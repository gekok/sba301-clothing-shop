# GIẢI THÍCH CHI TIẾT CÁC FILE DTO (DATA TRANSFER OBJECTS)

Các file DTO đóng vai trò là "Cấu trúc gói tin JSON" truyền giữa Frontend (Client) và Backend (REST API) cho phân hệ Giỏ hàng & Thanh toán.

---

## I. DTO PHÂN HỆ GIỎ HÀNG (CART DTOs)

### 1. `AddCartItemRequest.java`
- *Đường dẫn:* `backend/src/main/java/com/sba301/ecommerce/features/cart/dto/AddCartItemRequest.java`
- *Nội dung JSON gửi từ Client:*
  ```json
  {
    "variantId": 10,
    "quantity": 2
  }
  ```
- *Giải thích:* Chứa `variantId` (Mã biến thể sản phẩm được chọn) và `quantity` (Số lượng mua).

### 2. `CartResponse.java` & `CartItemResponse.java`
- *Đường dẫn:* `backend/src/main/java/com/sba301/ecommerce/features/cart/dto/CartResponse.java` & `CartItemResponse.java`
- *Nội dung JSON Backend trả về Client:*
  ```json
  {
    "id": 1,
    "items": [
      {
        "id": 5,
        "variantId": 10,
        "productId": 2,
        "productName": "Áo Thun Oversize",
        "variantInfo": "Trắng / L",
        "price": 250000.00,
        "quantity": 2,
        "subtotal": 500000.00
      }
    ]
  }
  ```

---

## II. DTO PHÂN HỆ KHÓA KHO & THANH TOÁN (CHECKOUT & ORDER DTOs)

### 1. `InitCheckoutSessionRequest.java`
- *Nội dung JSON gửi từ Client:*
  ```json
  {
    "cartItemIds": [5, 6]
  }
  ```
- *Giải thích:* Mảng các ID món hàng trong giỏ mà người dùng tick chọn mua.

### 2. `CheckoutSessionResponse.java`
- *Nội dung JSON Backend trả về:*
  ```json
  {
    "sessionId": "ea86a99e-729f-4dd8-980e-b03550e1df2d",
    "expiresAt": "2026-07-22T00:30:00",
    "items": [...]
  }
  ```
- *Giải thích:* Trả về mã chuỗi UUID phiên và thời điểm hết hạn 15 phút sau để Frontend làm đồng hồ đếm ngược.

### 3. `CreateOrderRequest.java`
- *Nội dung JSON gửi từ Client khi ấn Đặt Hàng:*
  ```json
  {
    "sessionId": "ea86a99e-729f-4dd8-980e-b03550e1df2d",
    "paymentMethod": "VNPAY",
    "shippingFee": 30000,
    "note": "Giao giờ hành chính"
  }
  ```

### 4. `OrderResponse.java`
- *Nội dung JSON Backend trả về:*
  ```json
  {
    "orderCode": "ORD-20260722-X8A2",
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "totalAmount": 530000.00,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  }
  ```
