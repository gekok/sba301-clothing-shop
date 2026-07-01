package com.sba301.ecommerce.features.product.repository;

import com.sba301.ecommerce.features.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sba301.ecommerce.features.entities.Product;
import com.sba301.ecommerce.features.entities.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    // Danh sách sản phẩm chưa bị xóa
    Page<Product> findByDeletedAtIsNull(Pageable pageable);

    // Lấy sản phẩm theo id
    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    // Kiểm tra slug đã tồn tại chưa
    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    // Search theo tên
    Page<Product> findByDeletedAtIsNullAndNameContainingIgnoreCase(
            String keyword,
            Pageable pageable
    );

    // Filter theo status
    Page<Product> findByDeletedAtIsNullAndStatus(
            ProductStatus status,
            Pageable pageable
    );
}

