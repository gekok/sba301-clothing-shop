# GIẢI THÍCH CHI TIẾT FILE REPOSITORY: InventoryReservationRepository.java & OrderRepository.java

- **Đường dẫn tương đối:** 
  - `backend/src/main/java/com/sba301/ecommerce/features/order/repository/InventoryReservationRepository.java`
  - `backend/src/main/java/com/sba301/ecommerce/features/order/repository/OrderRepository.java`

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT

### 1. `InventoryReservationRepository.java`
```java
package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {

    // Tìm tất cả các bản ghi khóa kho theo sessionId
    List<InventoryReservation> findBySessionId(String sessionId);

    // Tìm tất cả các bản ghi khóa kho theo userId
    List<InventoryReservation> findByUserId(Long userId);

    // Tìm các phiên khóa kho đã hết hạn (expiresAt nhỏ hơn thời gian hiện tại) để Scheduled Job dọn dẹp
    List<InventoryReservation> findAllByExpiresAtBefore(LocalDateTime now);

    // Câu lệnh JPQL tính tổng số lượng sản phẩm chính user đó đang giữ tạm
    @Query("SELECT SUM(r.quantity) FROM InventoryReservation r WHERE r.user.id = :userId AND r.variant.id = :variantId")
    Integer getReservedQuantityForUserAndVariant(@Param("userId") Long userId, @Param("variantId") Long variantId);
}
```

---

### 2. `OrderRepository.java`
```java
package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm danh sách đơn hàng của User, sắp xếp theo thời gian tạo mới nhất lên đầu
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Tìm đơn hàng theo mã orderCode và fetch sẵn danh sách sản phẩm bên trong
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i WHERE o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeWithItems(@Param("orderCode") String orderCode);
}
```
