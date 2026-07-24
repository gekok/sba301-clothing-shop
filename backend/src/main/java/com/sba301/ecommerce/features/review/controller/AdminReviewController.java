package com.sba301.ecommerce.features.review.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@Tag(name = "Admin Reviews", description = "Quản trị đánh giá sản phẩm (ẩn/hiện)")
@PreAuthorize("hasAnyAuthority('ADMIN','STAFF')")
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping
    @Operation(summary = "Tìm kiếm/liệt kê TOÀN BỘ review (kể cả đã ẩn), lọc theo product/rating/trạng thái/từ khoá")
    public ResponseEntity<Page<AdminReviewResponse>> search(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Boolean isVisible,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                adminReviewService.search(productId, rating, isVisible, keyword, stripSort(pageable)));
    }

    @PatchMapping("/{id}/visibility")
    @Operation(summary = "Ẩn hoặc khôi phục 1 review — ghi AuditLog")
    public ResponseEntity<AdminReviewResponse> updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewVisibilityRequest request) {
        return ResponseEntity.ok(adminReviewService.updateVisibility(id, request));
    }

    private Pageable stripSort(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    }
}
