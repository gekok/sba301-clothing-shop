package com.sba301.ecommerce.features.review.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sba301.ecommerce.features.review.dto.AdminReviewResponse;
import com.sba301.ecommerce.features.review.dto.UpdateReviewVisibilityRequest;

public interface AdminReviewService {

    // Mọi tham số lọc đều cho phép null (keyword cho phép null/rỗng) = không lọc theo tiêu chí đó.
    // Trả TOÀN BỘ review, kể cả isVisible=false — khác getReviewsByProduct công khai.
    Page<AdminReviewResponse> search(Long productId, Integer rating, Boolean isVisible,
                                      String keyword, Pageable pageable);

    // Ẩn/hiện 1 review, ghi AuditLog trong cùng transaction.
    AdminReviewResponse updateVisibility(Long reviewId, UpdateReviewVisibilityRequest request);
}
