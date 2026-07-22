package com.sba301.ecommerce.features.review.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sba301.ecommerce.exception.DuplicateReviewException;
import com.sba301.ecommerce.exception.InvalidCredentialsException;
import com.sba301.ecommerce.exception.ReviewNotEligibleException;
import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.Review;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.repository.OrderItemRepository;
import com.sba301.ecommerce.features.review.dto.ReviewRequest;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;
import com.sba301.ecommerce.features.review.dto.ReviewSummaryResponse;
import com.sba301.ecommerce.features.review.mapper.ReviewMapper;
import com.sba301.ecommerce.features.review.repository.ReviewRepository;
import com.sba301.ecommerce.security.user.CurrentUserProvider;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

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
        // userId lấy từ SecurityContext (người đang đăng nhập), KHÔNG lấy từ
        // request body — tránh 1 user tự ý gửi userId của người khác để mạo danh
        // đánh giá (cùng pattern CurrentUserProvider đã dùng ở Cart/Order/Pos).
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
                .findByProduct_IdOrderByCreatedAtDesc(productId, pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummaryByProduct(Long productId) {
        List<Integer> ratings = reviewRepository.findAllRatingsByProductId(productId);

        long total = ratings.size();
        double average = ratings.stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        Map<Integer, Long> breakdown = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            final int s = star;
            long count = ratings.stream().filter(r -> r == s).count();
            breakdown.put(s, count);
        }

        return ReviewSummaryResponse.builder()
                .productId(productId)
                .averageRating(Math.round(average * 10.0) / 10.0)
                .totalReviews(total)
                .breakdown(breakdown)
                .build();
    }
}
