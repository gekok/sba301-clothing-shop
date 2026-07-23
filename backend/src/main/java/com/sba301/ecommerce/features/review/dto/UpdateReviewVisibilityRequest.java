package com.sba301.ecommerce.features.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Dùng cho PATCH /admin/reviews/{id}/visibility (Phase 3b) — admin/staff ẩn hoặc khôi phục 1 review.
// @NotNull bắt buộc FE phải gửi rõ true/false, không được để trống rồi suy luận "toggle ngược lại
// giá trị hiện tại" ở server — tránh trường hợp 2 tab admin cùng bấm gần nhau đọc nhầm trạng thái cũ.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewVisibilityRequest {
    @NotNull(message = "isVisible không được để trống")
    private Boolean isVisible;
}
