# GIẢI THÍCH CHI TIẾT FILE CONTROLLER & SERVICE: OrderController.java & OrderServiceImpl.java

- **Đường dẫn tương đối:** 
  - `backend/src/main/java/com/sba301/ecommerce/features/order/controller/OrderController.java`
  - `backend/src/main/java/com/sba301/ecommerce/features/order/service/OrderServiceImpl.java`
- **Chức năng:** Tầng API và logic nghiệp vụ Đặt hàng, Callback VNPAY và Xem lịch sử đơn hàng.

---

## I. CONTROLLER (`OrderController.java`)

```java
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    // API: POST /api/v1/orders (Tạo đơn hàng mới)
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest createOrderRequest, HttpServletRequest request) {
        String clientIp = getClientIp(request); // Lấy IP người dùng để truyền sang VNPAY
        return ResponseEntity.ok(orderService.createOrder(createOrderRequest, clientIp));
    }

    // API: GET /api/v1/orders/vnpay-callback (Nhận phản hồi từ VNPAY sau khi khách bấm thanh toán/hủy)
    @GetMapping("/vnpay-callback")
    public ResponseEntity<OrderResponse> handleVNPayCallback(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(orderService.handleVNPayCallback(params));
    }

    // API: GET /api/v1/orders/me (Lấy danh sách lịch sử đơn hàng của người dùng hiện tại)
    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> listMyOrders() {
        return ResponseEntity.ok(orderService.listMyOrders());
    }
}
```

---

## II. SERVICE IMPLEMENTATION (`OrderServiceImpl.java`)

### 1. `createOrder(CreateOrderRequest request, String clientIp)`
1. Tìm danh sách reservation từ `sessionId`.
2. Tạo mã đơn ngẫu nhiên `orderCode = "ORD-" + System.currentTimeMillis()`.
3. Tạo đối tượng `Order` (`PENDING`, `UNPAID`), đóng gói mảng `orderItems`.
4. **Dọn dẹp giỏ hàng:** Tìm các `CartItem` tương ứng trong giỏ của User và xóa khỏi DB.
5. **Chuyển hóa Reservation:** Xóa các bản ghi giữ hàng tạm thời `reservationRepository.deleteAll(reservations)`.
6. **Tạo link VNPAY:** Nếu `request.getPaymentMethod()` là `"VNPAY"` ➔ Gọi `vnPayConfig.getPaymentUrl()` sinh mã băm SHA-512 và gán vào `response.setPaymentUrl(...)`.

### 2. `handleVNPayCallback(Map<String, String> vnpParams)`
1. Gọi `vnPayConfig.verifySignature(vnpParams, secureHash)` kiểm tra tính hợp lệ của chữ ký.
2. Tìm đơn hàng trong CSDL theo `orderCode = vnpParams.get("vnp_TxnRef")`.
3. Kiểm tra mã `vnp_ResponseCode`:
   - **Mã `"00"` (Thành công):** Đổi `order.setStatus(CONFIRMED)`, `order.setPaymentStatus(PAID)`.
   - **Mã khác `"00"` (Hủy/Thất bại):** Đổi `order.setStatus(CANCELLED)`, `order.setPaymentStatus(UNPAID)`. **Hoàn trả kho:** Lặp qua từng `OrderItem`, cộng lại số lượng `variant.setStockQuantity(stock + item.getQuantity())` và lưu DB.

### 3. `listMyOrders()`
- Lấy `currentUser` từ Security Context.
- Gọi `orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())` lấy toàn bộ đơn hàng của khách xếp mới nhất lên đầu.
- Map danh sách sang `OrderResponse` DTO trả về cho Frontend.
