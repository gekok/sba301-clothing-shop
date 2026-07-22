# GIẢI THÍCH CHI TIẾT FILE ENTITY: CartItem.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/CartItem.java`
- **Chức năng:** Ánh xạ bảng `cart_items`, lưu từng mặt hàng cụ thể (biến thể sản phẩm + số lượng) trong Giỏ hàng.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
public class CartItem extends BaseEntity {

    // Khóa ngoại liên kết tới Giỏ hàng sở hữu món này
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    // Khóa ngoại liên kết tới Biến thể sản phẩm (Variant: Size, Màu sắc, Giá)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Số lượng sản phẩm khách chọn trong giỏ
    @Column(nullable = false)
    private Integer quantity;
}
```
