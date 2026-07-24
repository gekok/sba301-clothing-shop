package com.sba301.ecommerce.features.review.service;

import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.features.audit.service.AuditAction;
import com.sba301.ecommerce.features.audit.service.AuditLogService;
import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.review.dto.AdminReviewResponse;
import com.sba301.ecommerce.features.review.dto.UpdateReviewVisibilityRequest;
import com.sba301.ecommerce.features.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminReviewServiceImpl implements AdminReviewService {

    private final ReviewRepository reviewRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminReviewResponse> search(Long productId, Integer rating, Boolean isVisible,
                                            String keyword, Pageable pageable) {
        String kw = keyword == null ? "" : keyword.trim();

        return reviewRepository.searchForAdmin(productId, rating, isVisible, kw, pageable)
                .map(this::toAdminResponse);
    }

    @Override
    @Transactional
    public AdminReviewResponse updateVisibility(Long reviewId, UpdateReviewVisibilityRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review id = " + reviewId));

        Boolean from = review.getIsVisible();
        Boolean to = request.getIsVisible();

        review.setIsVisible(to);
        Review saved = reviewRepository.save(review);

        if (!Objects.equals(from, to)) {
            Map<String, Object> changes = new LinkedHashMap<>();
            changes.put("isVisible", Map.of("from", from, "to", to));
            auditLogService.record(AuditAction.REVIEW_VISIBILITY_CHANGED, AuditAction.TARGET_REVIEW,
                    saved.getId(), changes);
        }

        return toAdminResponse(saved);
    }

    private AdminReviewResponse toAdminResponse(Review review) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .authorName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isVisible(review.getIsVisible())
                .build();
    }
}