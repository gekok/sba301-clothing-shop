# GIẢI THÍCH CHI TIẾT FILE ENTITY: InventoryReservation.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/InventoryReservation.java`
- **Chức năng:** Ánh xạ bảng `inventory_reservations`, lưu thông tin **Khóa tồn kho 15 phút** khi người dùng tiến hành thanh toán ở trang Checkout.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_reservations")
@Getter
@Setter
@NoArgsConstructor
public class InventoryReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Chuỗi UUID ngẫu nhiên duy nhất đại diện cho phiên thanh toán
    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    // Khách hàng đang giữ hàng trong kho
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Sản phẩm biến thể đang bị khóa số lượng
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Số lượng hàng tạm giữ
    @Column(nullable = false)
    private Integer quantity;

    // Thời điểm hết hạn phiên giữ hàng (Thời gian khởi tạo + 15 phút)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
```
