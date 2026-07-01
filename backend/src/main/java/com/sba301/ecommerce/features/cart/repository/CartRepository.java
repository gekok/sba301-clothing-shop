package com.sba301.ecommerce.features.cart.repository;

import com.sba301.ecommerce.features.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// TODO: Optional<Cart> findByUserId(Long userId);
//   @Query fetch-join findByUserIdWithItems: items -> variant -> product (1 collection -> không MultipleBagFetchException).
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
}
