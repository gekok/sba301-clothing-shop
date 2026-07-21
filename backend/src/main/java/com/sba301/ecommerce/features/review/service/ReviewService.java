package com.sba301.ecommerce.features.review.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sba301.ecommerce.features.review.dto.ReviewRequest;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;
import com.sba301.ecommerce.features.review.dto.ReviewSummaryResponse;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request, Long productId);
    Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable);
    ReviewSummaryResponse getSummaryByProduct(Long productId);
}
