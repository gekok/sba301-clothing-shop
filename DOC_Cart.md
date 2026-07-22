# GIẢI THÍCH CHI TIẾT FILE ENTITY: Cart.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/entities/Cart.java`
- **Chức năng:** Thực thể ánh xạ bảng `carts` trong cơ sở dữ liệu SQL Server, lưu thông tin Giỏ hàng của từng Người dùng.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity // Khai báo đây là một JPA Entity được quản lý bởi Hibernate
@Table(name = "carts",
        uniqueConstraints = @UniqueConstraint(name = "uk_carts_user", columnNames = "user_id")) // Mỗi User chỉ có duy nhất 1 Giỏ hàng
@Getter // Lombok tự sinh các hàm getId(), getUser(), getItems()
@Setter // Lombok tự sinh các hàm setUser(), setItems()
@NoArgsConstructor // Lombok tự sinh Constructor rỗng mặc định
public class Cart extends BaseEntity {

    // Mối quan hệ 1-1 với đối tượng User (Mỗi giỏ hàng thuộc về 1 khách hàng)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_carts_user"))
    private User user;

    // Mối quan hệ 1-Nhiều với CartItem (Một giỏ hàng chứa nhiều món hàng)
    // cascade = CascadeType.ALL: Khi xóa Cart thì tự xóa các CartItem bên trong
    // orphanRemoval = true: Khi gỡ 1 CartItem khỏi mảng items thì tự xóa trong DB
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();
}
```
