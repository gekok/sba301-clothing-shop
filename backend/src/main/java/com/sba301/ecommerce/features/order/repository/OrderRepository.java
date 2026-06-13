package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: List<Order> findByUserId(Long); Optional<Order> findByOrderCode(String) (fetch-join items->variant).
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
