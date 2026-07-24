package com.sba301.ecommerce.features.review.service;

import com.sba301.ecommerce.features.review.dto.AdminReviewResponse;
import com.sba301.ecommerce.features.review.dto.UpdateReviewVisibilityRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminReviewService {
    Page<AdminReviewResponse> search(Long productId, Integer rating, Boolean isVisible, String keyword, Pageable pageable);

    AdminReviewResponse updateVisibility(Long reviewId, UpdateReviewVisibilityRequest request);
}
