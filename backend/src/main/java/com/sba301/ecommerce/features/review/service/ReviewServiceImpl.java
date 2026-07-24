package com.sba301.ecommerce.features.review.service;

import com.sba301.ecommerce.exception.*;
import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.repository.OrderItemRepository;
import com.sba301.ecommerce.features.review.constant.ReviewConstants;
import com.sba301.ecommerce.features.review.dto.ReviewRequest;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;
import com.sba301.ecommerce.features.review.dto.ReviewSummaryResponse;
import com.sba301.ecommerce.features.review.dto.ReviewUpdateRequest;
import com.sba301.ecommerce.features.review.mapper.ReviewMapper;
import com.sba301.ecommerce.features.review.repository.ReviewRepository;
import com.sba301.ecommerce.security.user.CurrentUserProvider;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final CurrentUserProvider currentUserProvider;
    private final OrderItemRepository orderItemRepository;

    private static final List<OrderStatus> ELIGIBLE_STATUSES = List.of(OrderStatus.DELIVERED, OrderStatus.COMPLETED);

    @Override
    @Transactional
    public ReviewResponse createReview(ReviewRequest request, Long productId) {
        User user = currentUserProvider.getCurrentUser()
                .orElseThrow(() -> new InvalidCredentialsException("Bạn cần đăng nhập để đánh giá sản phẩm."));

        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy order item."));

        Long actualProductId = orderItem.getVariant().getProduct().getId();
        if (!actualProductId.equals(productId)) {
            throw new ReviewNotEligibleException("ProductId trong URL không khớp với product của orderItem");
        }

        Order order = orderItem.getOrder();

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ReviewNotEligibleException(
                    "Đơn hàng này không thuộc về bạn, không thể đánh giá.");
        }

        if (!ELIGIBLE_STATUSES.contains(order.getStatus())) {
            throw new ReviewNotEligibleException(
                    "Đơn hàng chưa được giao hoặc chưa hoàn tất, không thể đánh giá.");
        }

        if (reviewRepository.existsByUser_IdAndOrderItem_Id(user.getId(), orderItem.getId())) {
            throw new DuplicateReviewException(
                    "Bạn đã đánh giá sản phẩm này rồi, không thể đánh giá lại.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(orderItem.getVariant().getProduct());
        review.setOrderItem(orderItem);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository
                .findByProduct_IdAndIsVisibleTrueOrderByCreatedAtDesc(productId, pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummaryByProduct(Long productId) {
        List<Integer> ratings = reviewRepository.findVisibleRatingsByProductId(productId);

        long total = ratings.size();
        double average = ratings.stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        Map<Integer, Long> countsByRating = ratings.stream()
                .collect(Collectors.groupingBy(r -> r, Collectors.counting()));
        Map<Integer, Long> breakdown = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            breakdown.put(star, countsByRating.getOrDefault(star, 0L));
        }

        return ReviewSummaryResponse.builder()
                .productId(productId)
                .averageRating(Math.round(average * 10.0) / 10.0)
                .totalReviews(total)
                .breakdown(breakdown)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long productId, Long reviewId, ReviewUpdateRequest request) {
        User user = currentUserProvider.getCurrentUser()
                .orElseThrow(() -> new InvalidCredentialsException("Bạn cần đăng nhập để sửa đánh giá."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review."));

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy review.");
        }

        if (!review.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Không tìm thấy review.");
        }

        if (Boolean.FALSE.equals(review.getIsVisible())) {
            throw new ReviewAccessDeniedException(
                    "Đánh giá này đã bị quản trị viên ẩn, không thể chỉnh sửa.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (review.getCreatedAt().plusHours(ReviewConstants.EDIT_WINDOW_HOURS).isBefore(now)) {
            throw new ReviewAccessDeniedException(
                    "Đã quá 24 giờ kể từ khi tạo đánh giá, không thể chỉnh sửa.");
        }

        if (ChronoUnit.SECONDS.between(review.getCreatedAt(), review.getUpdatedAt())
                > ReviewConstants.EDIT_DETECTION_TOLERANCE_SECONDS) {
            throw new ReviewAccessDeniedException(
                    "Đánh giá này đã được chỉnh sửa trước đó, chỉ được sửa 1 lần.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved);
    }
}
