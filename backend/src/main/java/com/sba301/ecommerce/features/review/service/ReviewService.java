package com.sba301.ecommerce.features.review.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sba301.ecommerce.features.review.dto.ReviewRequest;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;
import com.sba301.ecommerce.features.review.dto.ReviewSummaryResponse;
import com.sba301.ecommerce.features.review.dto.ReviewUpdateRequest;

public interface ReviewService {
    ReviewResponse createReview(ReviewRequest request, Long productId);
    Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable);
    ReviewSummaryResponse getSummaryByProduct(Long productId);

    // Phase 2b — sửa review của chính mình (chỉ rating/comment). Ownership mismatch -> 404
    // (ResourceNotFoundException); đã sửa 1 lần / quá 24h / đã bị admin ẩn -> 403
    // (ReviewAccessDeniedException). Xem ReviewServiceImpl để biết chi tiết từng điều kiện.
    ReviewResponse updateReview(Long productId, Long reviewId, ReviewUpdateRequest request);
}
