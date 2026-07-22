# GIẢI THÍCH CHI TIẾT FILE REPOSITORY: CartRepository.java & CartItemRepository.java

- **Đường dẫn tương đối:** 
  - `backend/src/main/java/com/sba301/ecommerce/features/cart/repository/CartRepository.java`
  - `backend/src/main/java/com/sba301/ecommerce/features/cart/repository/CartItemRepository.java`
- **Chức năng:** Tầng truy vấn CSDL dành riêng cho Giỏ hàng bằng Spring Data JPA.

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT

### 1. `CartRepository.java`
```java
package com.sba301.ecommerce.features.cart.repository;

import com.sba301.ecommerce.features.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    // Tìm giỏ hàng theo userId và nạp (fetch) sẵn danh sách các CartItem bên trong trong cùng 1 câu SQL
    // Giúp tránh lỗi N+1 Query và LazyInitializationException
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.variant v LEFT JOIN FETCH v.product WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
}
```

---

### 2. `CartItemRepository.java`
```java
package com.sba301.ecommerce.features.cart.repository;

import com.sba301.ecommerce.features.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Kế thừa toàn bộ các hàm CRUD mặc định của JpaRepository như save(), deleteById(), findById()...
}
```
