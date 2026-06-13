package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: finders cho OrderItem neu can (vd findByOrderId).
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
