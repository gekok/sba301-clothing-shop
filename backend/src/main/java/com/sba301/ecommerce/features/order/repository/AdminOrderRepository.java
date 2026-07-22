package com.sba301.ecommerce.features.order.repository;

import com.sba301.ecommerce.features.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Repository riêng cho màn quản trị, tách khỏi OrderRepository (luồng khách hàng)
// để 2 nhánh phát triển song song không sửa chung 1 file. Spring Data cho phép
// nhiều interface repository cùng trỏ vào 1 entity.
@Repository
public interface AdminOrderRepository extends JpaRepository<Order, Long> {

    // Lấy sẵn user + nhân viên + dòng hàng + biến thể trong 1 câu SQL.
    // Không có JOIN FETCH thì mỗi đơn lại bắn thêm mấy query con (lỗi N+1),
    // và open-in-view=false nên chạm quan hệ lazy ngoài transaction là văng LazyInitializationException.
    // DISTINCT: JOIN FETCH sang danh sách items làm 1 đơn 3 sản phẩm bị nhân thành 3 dòng.
    // Chỉ FETCH được 1 collection - thêm o.payments nữa là Hibernate ném MultipleBagFetchException.
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "LEFT JOIN FETCH o.createdByStaff " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.variant " +
            "ORDER BY o.createdAt DESC")
    List<Order> findAllForAdmin();

    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "LEFT JOIN FETCH o.createdByStaff " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.variant " +
            "WHERE o.id = :id")
    Optional<Order> findByIdForAdmin(@Param("id") Long id);
}
