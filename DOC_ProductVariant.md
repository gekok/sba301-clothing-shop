# GIẢI THÍCH CHI TIẾT FILE ENTITY: ProductVariant.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/ProductVariant.java`
- **Chức năng:** Ánh xạ bảng `product_variants`, lưu các biến thể Size/Màu sắc/Số lượng tồn kho của sản phẩm.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 64)
    private String sku;

    // @Nationalized giúp SQL Server tự động tạo cột kiểu NVARCHAR (hỗ trợ Tiếng Việt Unicode có dấu)
    @Nationalized
    @Column(nullable = false, length = 20)
    private String size;

    @Nationalized
    @Column(nullable = false, length = 50)
    private String color;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    // Số lượng sản phẩm còn lại thực tế trong kho
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // @Version kích hoạt cơ chế Chống tranh chấp dữ liệu (Optimistic Locking)
    // Khi 2 người cùng đặt mua sản phẩm cuối cùng cùng 1 lúc, ai gửi sau sẽ bị từ chối tránh âm kho
    @Version
    @Column(nullable = false)
    private Long version = 0L;
}
```
