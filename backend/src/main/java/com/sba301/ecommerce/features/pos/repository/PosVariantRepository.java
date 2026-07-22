package com.sba301.ecommerce.features.pos.repository;

import com.sba301.ecommerce.features.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Chứa các truy vấn CHỈ màn POS cần (nạp kèm sản phẩm cha để dựng lưới chọn hàng).
// ProductVariantRepository của nhóm sản phẩm vẫn dùng bình thường cho các thao tác chung;
// Spring Data cho phép nhiều interface repository cùng trỏ vào 1 entity, và chúng dùng
// chung một EntityManager nên ghi qua đường nào cũng như nhau.
@Repository
public interface PosVariantRepository extends JpaRepository<ProductVariant, Long> {

    // JOIN FETCH product vì lưới chọn hàng cần tên sản phẩm. Thiếu nó thì mỗi biến thể
    // lại bắn thêm 1 query lấy Product (lỗi N+1).
    // JOIN (không LEFT) vì ProductVariant.product khai optional = false - luôn có sản phẩm cha.
    @Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p " +
            "WHERE v.isActive = true " +
            "ORDER BY p.name ASC, v.size ASC, v.color ASC")
    List<ProductVariant> findActiveWithProduct();

    @Query("SELECT v FROM ProductVariant v JOIN FETCH v.product WHERE v.id = :id")
    Optional<ProductVariant> findByIdWithProduct(@Param("id") Long id);
}
