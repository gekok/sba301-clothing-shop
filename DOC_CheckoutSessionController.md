# GIẢI THÍCH CHI TIẾT FILE CONTROLLER & SERVICE: CheckoutSessionController.java & CheckoutSessionService.java

- **Đường dẫn tương đối:** 
  - `backend/src/main/java/com/sba301/ecommerce/features/order/controller/CheckoutSessionController.java`
  - `backend/src/main/java/com/sba301/ecommerce/features/order/service/CheckoutSessionService.java`
- **Chức năng:** Tiếp nhận request REST API `/checkout/session` và thực thi thuật toán Khóa giữ hàng tồn kho 15 phút.

---

## I. CONTROLLER (`CheckoutSessionController.java`)

```java
@RestController
@RequestMapping("/checkout/session")
public class CheckoutSessionController {

    private final CheckoutSessionService checkoutSessionService;

    // API: POST /api/v1/checkout/session/init
    // Khởi tạo phiên khóa kho 15 phút cho các cartItemIds được tick chọn
    @PostMapping("/init")
    public ResponseEntity<CheckoutSessionResponse> initSession(@RequestBody InitCheckoutSessionRequest request) {
        return ResponseEntity.ok(checkoutSessionService.initSession(request));
    }

    // API: GET /api/v1/checkout/session/{sessionId}
    // Lấy thông tin chi tiết phiên khóa kho
    @GetMapping("/{sessionId}")
    public ResponseEntity<CheckoutSessionResponse> getSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(checkoutSessionService.getSession(sessionId));
    }
}
```

---

## II. SERVICE (`CheckoutSessionService.java`)

### 1. Thuật toán `initSession(InitCheckoutSessionRequest request)`
- **Giải phóng kho cũ:** Quét toàn bộ `InventoryReservation` cũ của user này, cộng trả lại số lượng tồn kho `variant.setStockQuantity(stock + qty)` và xóa các bản ghi cũ.
- **Tạo Session mới:**
  ```java
  String sessionId = UUID.randomUUID().toString(); // Mã ngẫu nhiên 36 ký tự
  LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15); // Thời điểm hết hạn 15 phút sau
  ```
- **Tạm trừ kho:** Với mỗi món hàng khách chọn:
  - Kiểm tra xem `quantity <= variant.getStockQuantity()`. Nếu không đủ ➔ Ném `BadRequestException("Sản phẩm không đủ số lượng trong kho.")`.
  - Tạm trừ kho: `variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity())`.
  - Tạo bản ghi `InventoryReservation` lưu `sessionId`, `user`, `variant`, `quantity`, `expiresAt`.

### 2. Tiến trình tự động giải phóng kho hết hạn (`releaseExpiredReservations()`)
```java
@Scheduled(fixedRate = 60000) // Khởi chạy định kỳ mỗi 60 giây ngầm
public void releaseExpiredReservations() {
    List<InventoryReservation> expired = reservationRepository.findAllByExpiresAtBefore(LocalDateTime.now());
    for (InventoryReservation res : expired) {
        ProductVariant variant = res.getVariant();
        // Cộng trả lại kho
        variant.setStockQuantity(variant.getStockQuantity() + res.getQuantity());
        variantRepository.save(variant);
    }
    reservationRepository.deleteAll(expired); // Xóa khỏi DB
}
```
