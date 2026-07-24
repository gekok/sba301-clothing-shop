package com.sba301.ecommerce.features.review.repository;

import com.sba301.ecommerce.features.entities.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<Review> findByProduct_IdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId, Pageable pageable);

    boolean existsByUser_IdAndOrderItem_Id(Long userId, Long orderItemId);

    @Query("SELECT r.rating FROM Review r WHERE r.product.id = :productId")
    List<Integer> findAllRatingsByProductId(@Param("productId") Long productId);

    @Query("SELECT r.rating FROM Review r WHERE r.product.id = :productId AND r.isVisible = true")
    List<Integer> findVisibleRatingsByProductId(@Param("productId") Long productId);

    @Query("SELECT r.orderItem.id FROM Review r WHERE r.user.id = :userId")
    List<Long> findReviewedOrderItemIdsByUserId(@Param("userId") Long userId);

    @Query(value = """
                SELECT r FROM Review r 
                JOIN FETCH r.product p
                JOIN FETCH r.user u
                WHERE (:productId IS NULL OR p.id = :productId)
                    AND (:rating IS NULL OR r.rating = :rating)
                    AND(:isVisible IS NULL OR r.isVisible = :isVisible)
                    AND(:keyword = '' 
                        OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))
                ORDER BY r.createdAt desc 
            """,
            countQuery = """
                    SELECT COUNT(r) FROM Review r
                    JOIN r.product p
                    JOIN r.user u
                    WHERE (:productId IS NULL OR p.id = :productId)
                        AND (:rating IS NULL OR r.rating = :rating)
                        AND (:isVisible IS NULL OR r.isVisible = :isVisible)
                        AND (:keyword = ''
                            OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """)
    Page<Review> searchForAdmin(@Param("productId") Long productId,
                                @Param("rating") Integer rating,
                                @Param("isVisible") Boolean isVisible,
                                @Param("keyword") String keyword,
                                Pageable pageable);
}