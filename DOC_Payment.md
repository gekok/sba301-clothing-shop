# GIẢI THÍCH CHI TIẾT FILE ENTITY: Payment.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/Payment.java`
- **Chức năng:** Ánh xạ bảng `payments`, lưu trữ lịch sử giao dịch thanh toán (VNPAY hoặc COD) của đơn hàng.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import com.sba301.ecommerce.features.entities.enums.PaymentMethod;
import com.sba301.ecommerce.features.entities.enums.PaymentTxnStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment extends BaseEntity {

    // Khóa ngoại liên kết tới Đơn hàng được thanh toán
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Số tiền thanh toán
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    // Phương thức thanh toán: COD hoặc VNPAY
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    // Trạng thái giao dịch: PENDING, SUCCESS, FAILED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentTxnStatus status = PaymentTxnStatus.PENDING;

    // Mã giao dịch trả về từ ngân hàng/VNPAY (vnp_TransactionNo)
    @Column(name = "transaction_ref", length = 64)
    private String transactionRef;

    // Thời điểm hoàn tất giao dịch thành công
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
```
