package com.sba301.ecommerce.features.review.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sba301.ecommerce.features.review.dto.AdminReviewResponse;
import com.sba301.ecommerce.features.review.dto.UpdateReviewVisibilityRequest;
import com.sba301.ecommerce.features.review.service.AdminReviewService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Đường dẫn đầy đủ: /api/admin/reviews. Tách khỏi ReviewController (luồng khách: xem/tạo/sửa review
// của chính mình) — cùng lý do tách AdminOrderController khỏi OrderController.
//
// @PreAuthorize ở đây có hiệu lực bảo vệ THẬT ngay lập tức dù SecurityConfig đang permitAll ở tầng
// URL: @EnableMethodSecurity đã bật sẵn ở class-level của SecurityConfig, method security và URL
// security là 2 lớp độc lập. Đây là bảo vệ riêng cho /admin/reviews/**, KHÔNG đụng/không phụ thuộc
// SecurityConfig hay các controller khác (xem OVERVIEW Phần 5, rủi ro #5).
@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@Tag(name = "Admin Reviews", description = "Quản trị đánh giá sản phẩm (ẩn/hiện)")
@PreAuthorize("hasAnyRole('ADMIN','STAFF')")
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping
    @Operation(summary = "Tìm kiếm/liệt kê TOÀN BỘ review (kể cả đã ẩn), lọc theo product/rating/trạng thái/từ khoá")
    public ResponseEntity<Page<AdminReviewResponse>> search(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean isVisible,
            @RequestParam(required = false) String keyword,
            // Không set sort ở đây: searchForAdmin đã cứng ORDER BY r.createdAt DESC trong @Query —
            // thêm sort=createdAt ở Pageable sẽ làm SQL Server báo lỗi "column specified more than
            // once in the order by list" (cùng bẫy đã ghi ở ReviewController/AdminOrderController).
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(adminReviewService.search(productId, rating, isVisible, keyword, pageable));
    }

    @PatchMapping("/{id}/visibility")
    @Operation(summary = "Ẩn hoặc khôi phục 1 review — ghi AuditLog")
    public ResponseEntity<AdminReviewResponse> updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewVisibilityRequest request) {
        return ResponseEntity.ok(adminReviewService.updateVisibility(id, request));
    }
}
