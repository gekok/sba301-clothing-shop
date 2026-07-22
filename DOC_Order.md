# GIẢI THÍCH CHI TIẾT FILE ENTITY: Order.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/Order.java`
- **Chức năng:** Ánh xạ bảng `orders`, lưu trữ toàn bộ Đơn hàng đã được khởi tạo.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderPaymentStatus;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order extends BaseEntity {

    // Mã đơn hàng duy nhất hiển thị cho khách (Ví dụ: ORD-20260722-A9F2)
    @Column(name = "order_code", nullable = false, length = 32, unique = true)
    private String orderCode;

    // Khách hàng sở hữu đơn hàng
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Kênh bán hàng: ONLINE (khách tự mua) hoặc POS (bán tại quầy)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderChannel channel = OrderChannel.ONLINE;

    // Trạng thái đơn hàng: PENDING (Chờ xử lý), CONFIRMED (Đã xác nhận), CANCELLED (Đã hủy)...
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    // Trạng thái thanh toán: UNPAID (Chưa thanh toán), PAID (Đã thanh toán)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private OrderPaymentStatus paymentStatus = OrderPaymentStatus.UNPAID;

    // Tổng giá trị sản phẩm trong đơn (chưa tính phí ship)
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;

    // Phí vận chuyển
    @Column(name = "shipping_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    // Tổng số tiền khách phải thanh toán (subtotal + shippingFee)
    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    // Ghi chú đơn hàng do người dùng nhập khi Checkout
    @Column(length = 500)
    private String note;

    // Danh sách các món hàng trong đơn
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Lịch sử các giao dịch thanh toán gắn với đơn
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();
}
```
