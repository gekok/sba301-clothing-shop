package com.sba301.ecommerce.features.cart.repository;

import com.sba301.ecommerce.features.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("SELECT ci FROM CartItem ci " +
           "LEFT JOIN FETCH ci.variant v " +
           "LEFT JOIN FETCH v.product p " +
           "WHERE ci.id = :id")
    Optional<CartItem> findByIdWithVariant(@Param("id") Long id);
}
