package com.sba301.ecommerce.features.cart.repository;

import com.sba301.ecommerce.features.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    @Query("SELECT i FROM CartItem i " +
           "JOIN FETCH i.cart c " +
           "JOIN FETCH c.user " +
           "JOIN FETCH i.variant v " +
           "JOIN FETCH v.product " +
           "WHERE i.id = :id")
    Optional<CartItem> findByIdWithVariant(@Param("id") Long id);
}
