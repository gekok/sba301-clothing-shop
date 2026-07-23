package com.sba301.ecommerce.features.review.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.features.audit.service.AuditAction;
import com.sba301.ecommerce.features.audit.service.AuditLogService;
import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.review.dto.AdminReviewResponse;
import com.sba301.ecommerce.features.review.dto.UpdateReviewVisibilityRequest;
import com.sba301.ecommerce.features.review.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminReviewServiceImpl implements AdminReviewService {

    private final ReviewRepository reviewRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminReviewResponse> search(Long productId, Integer rating, Boolean isVisible,
                                             String keyword, Pageable pageable) {
        // keyword dùng sentinel '' (không lọc) — đồng bộ convention searchForAdmin/
        // AuditLogRepository.searchRecentWithActor. productId/rating/isVisible dùng null.
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

        // Ghi nhật ký trong cùng transaction với bước cập nhật (cùng nguyên tắc AdminOrderServiceImpl.
        // updateStatus) — cập nhật hỏng thì log cũng rollback theo, không để lại log "ma".
        Map<String, Object> changes = new LinkedHashMap<>();
        changes.put("isVisible", Map.of("from", from, "to", to));
        auditLogService.record(AuditAction.REVIEW_VISIBILITY_CHANGED, AuditAction.TARGET_REVIEW,
                saved.getId(), changes);

        return toAdminResponse(saved);
    }

    // Không dùng MapStruct (ReviewMapper) ở đây: searchForAdmin JOIN FETCH sẵn product/user nên
    // không cần lazy-load thêm; giữ mapping thủ công đơn giản cho đúng phạm vi file của Phase 3b
    // (không tạo thêm AdminReviewMapper — xem PLAN_..._SPLIT.md mục "File" của 3b).
    private AdminReviewResponse toAdminResponse(Review review) {
        return AdminReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .userId(review.getUser().getId())
                .authorName(review.getUser().getFullName())
                .orderItemId(review.getOrderItem().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .isVisible(review.getIsVisible())
                .build();
    }
}
