package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderCode(String orderCode);

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.variant v " +
           "WHERE o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeWithItems(@Param("orderCode") String orderCode);

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.variant v " +
           "WHERE o.status = :status AND o.createdAt <= :thresholdDate")
    List<Order> findByStatusAndCreatedAtBeforeWithItems(@Param("status") com.sba301.ecommerce.features.entities.enums.OrderStatus status, @Param("thresholdDate") java.time.LocalDateTime thresholdDate);
}
