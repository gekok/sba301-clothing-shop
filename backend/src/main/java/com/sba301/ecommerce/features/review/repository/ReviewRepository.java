package com.sba301.ecommerce.features.review.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sba301.ecommerce.features.entities.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    boolean existsByUser_IdAndOrderItem_Id(Long userId, Long orderItemId);

    Optional<Review> findByUser_IdAndOrderItem_Id(Long userId, Long orderItemId);

    @Query("SELECT r.rating FROM Review r WHERE r.product.id = :productId")
    List<Integer> findAllRatingsByProductId(@Param("productId") Long productId);
    
}
