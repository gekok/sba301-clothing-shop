# GIẢI THÍCH CHI TIẾT FILE ENTITY: OrderItem.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/OrderItem.java`
- **Chức năng:** Ánh xạ bảng `order_items`, lưu thông tin chi tiết từng sản phẩm được mua trong Đơn hàng.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem extends BaseEntity {

    // Khóa ngoại tới Đơn hàng chứa sản phẩm này
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Khóa ngoại tới Biến thể sản phẩm
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Lưu chụp tên sản phẩm tại thời điểm mua (Tránh bị đổi tên trong tương lai)
    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    // Lưu chụp màu sắc & size tại thời điểm mua (VD: "Trắng / L")
    @Column(name = "variant_info", nullable = false, length = 255)
    private String variantInfo;

    // Đơn giá tại thời điểm đặt hàng
    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    // Số lượng mua
    @Column(nullable = false)
    private Integer quantity;

    // Thành tiền của dòng này (unitPrice * quantity)
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;
}
```
