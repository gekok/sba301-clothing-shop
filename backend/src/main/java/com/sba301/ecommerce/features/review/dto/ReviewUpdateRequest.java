package com.sba301.ecommerce.features.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Dùng cho PUT /products/{productId}/reviews/{reviewId} (Phase 2b) — khách hàng chỉ được sửa
// rating/comment của chính review mình, KHÔNG có orderItemId (không được đổi review sang order
// item khác, tránh vi phạm unique constraint (user_id, order_item_id) — xem OVERVIEW Phần 5, rủi ro #6).
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpdateRequest {
    @NotNull(message = "rating không được để trống")
    @Min(value = 1, message = "rating tối thiểu là 1")
    @Max(value = 5, message = "rating tối đa là 5")
    private Integer rating;

    @Size(max = 1000, message = "comment tối đa 1000 ký tự")
    private String comment;
}
