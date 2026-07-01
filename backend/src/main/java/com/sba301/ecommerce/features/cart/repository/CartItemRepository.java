package com.sba301.ecommerce.features.cart.repository;

import com.sba301.ecommerce.features.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: @Query fetch-join findByIdWithVariant(Long id): variant -> product.
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
