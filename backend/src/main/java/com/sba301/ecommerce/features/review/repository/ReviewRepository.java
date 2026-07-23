package com.sba301.ecommerce.features.review.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.sba301.ecommerce.features.entities.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProduct_IdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    // Dùng cho API công khai (GET .../reviews) — loại review đã bị admin ẩn (isVisible=false).
    // Giữ nguyên method cũ ở trên (không sửa chữ ký) — 2 hàm đọc công khai trong
    // ReviewServiceImpl sẽ chuyển sang gọi method mới này.
    Page<Review> findByProduct_IdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId, Pageable pageable);

    boolean existsByUser_IdAndOrderItem_Id(Long userId, Long orderItemId);

    @Query("SELECT r.rating FROM Review r WHERE r.product.id = :productId")
    List<Integer> findAllRatingsByProductId(@Param("productId") Long productId);

    // Dùng cho /summary công khai — chỉ tính rating của review đang hiển thị (isVisible=true).
    @Query("SELECT r.rating FROM Review r WHERE r.product.id = :productId AND r.isVisible = true")
    List<Integer> findVisibleRatingsByProductId(@Param("productId") Long productId);

    // Dùng để đánh dấu hàng loạt order_item nào của user đã review rồi (vd khi
    // liệt kê đơn hàng), tránh gọi existsByUser_IdAndOrderItem_Id lặp lại N lần.
    @Query("SELECT r.orderItem.id FROM Review r WHERE r.user.id = :userId")
    List<Long> findReviewedOrderItemIdsByUserId(@Param("userId") Long userId);

    // Phase 3a — dùng cho GET /admin/reviews (Phase 3b): admin xem TOÀN BỘ review, kể cả đã ẩn,
    // lọc theo product/rating/trạng thái ẩn-hiện/từ khoá, có phân trang.
    // JOIN FETCH product + user (đều @ManyToOne, phía "1" của quan hệ) để AdminReviewResponse lấy
    // được productName/authorName mà không bắn thêm query con (N+1) — cùng lý do JOIN FETCH đã dùng
    // ở AdminOrderRepository.findAllForAdmin(). Không cần DISTINCT như bên Order vì Review không
    // JOIN FETCH sang collection nào (không có nguy cơ nhân dòng).
    //
    // Tham số Long/Integer/Boolean dùng "(:x IS NULL OR field = :x)" — không có kiểu để làm sentinel
    // rỗng như String, nên bắt buộc dùng NULL để biểu diễn "không lọc theo tiêu chí đó" (service layer
    // truyền thẳng null khi FE không gửi tham số). Riêng keyword vẫn theo đúng convention sentinel ''
    // đã dùng ở AuditLogRepository.searchRecentWithActor để đồng bộ trong cùng codebase.
    //
    // Không set sort ở Pageable khi gọi method này (giống lưu ý ở ReviewController/AdminOrderController):
    // ORDER BY r.createdAt DESC đã cứng trong @Query, thêm sort=createdAt ở Pageable sẽ làm SQL Server
    // báo lỗi "column has been specified more than once in the order by list".
    @Query(value = "SELECT r FROM Review r "
            + "JOIN FETCH r.product p "
            + "JOIN FETCH r.user u "
            + "WHERE (:productId IS NULL OR p.id = :productId) "
            + "AND (:rating IS NULL OR r.rating = :rating) "
            + "AND (:isVisible IS NULL OR r.isVisible = :isVisible) "
            + "AND (:keyword = '' "
            + "     OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "     OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "     OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "ORDER BY r.createdAt DESC",
            countQuery = "SELECT COUNT(r) FROM Review r "
                    + "JOIN r.product p "
                    + "JOIN r.user u "
                    + "WHERE (:productId IS NULL OR p.id = :productId) "
                    + "AND (:rating IS NULL OR r.rating = :rating) "
                    + "AND (:isVisible IS NULL OR r.isVisible = :isVisible) "
                    + "AND (:keyword = '' "
                    + "     OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) "
                    + "     OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
                    + "     OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Review> searchForAdmin(@Param("productId") Long productId,
                                 @Param("rating") Integer rating,
                                 @Param("isVisible") Boolean isVisible,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);

}
