package com.sba301.ecommerce.features.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// DTO riêng cho GET /admin/reviews (Phase 3b) — KHÔNG dùng chung ReviewResponse của luồng khách hàng.
// Lý do (giống AdminOrderResponse ở order/dto): màn admin cần thêm productName để nhận diện review
// đang thuộc sản phẩm nào mà không phải gọi thêm API product, còn ReviewResponse public thì không cần
// field này. Chấp nhận 2 DTO hơi giống nhau để 2 luồng tiến hoá độc lập, không dẫm chân nhau.
// Khác ReviewResponse (createdAt/updatedAt kiểu String): giữ nguyên LocalDateTime ở đây vì
// AdminReviewResponse chỉ phục vụ bảng quản trị (FE tự format), không có yêu cầu tương thích ngược
// như ReviewResponse.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String authorName;
    private Long orderItemId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isVisible;
}
