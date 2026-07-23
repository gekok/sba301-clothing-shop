package com.sba301.ecommerce.features.review.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sba301.ecommerce.exception.DuplicateReviewException;
import com.sba301.ecommerce.exception.InvalidCredentialsException;
import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.exception.ReviewAccessDeniedException;
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
import com.sba301.ecommerce.features.review.dto.ReviewUpdateRequest;
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

    // Phase 2b — cửa sổ cho phép sửa: 1 lần, trong vòng 24h kể từ createdAt (giả định nghiệp vụ
    // tự đề xuất, xem OVERVIEW Phần 5 "Lưu ý về rule 24h/1-lần").
    private static final long EDIT_WINDOW_HOURS = 24;

    // @UpdateTimestamp trên Review.updatedAt set giá trị NGAY CẢ lúc INSERT (Hibernate ghi cùng lúc
    // với createdAt trong cùng 1 statement/transaction) — nên "updatedAt != null" KHÔNG dùng được để
    // phát hiện "đã sửa 1 lần" (xem PROGRESS_PHASE_2a, mục "Vấn đề tồn đọng"). Thay vào đó: coi review
    // là "đã từng sửa" nếu updatedAt lệch khỏi createdAt nhiều hơn ngưỡng này — đủ lớn để không nhầm
    // với sai số làm tròn/độ trễ ghi 2 cột trong cùng 1 lần INSERT, đủ nhỏ để không bỏ sót 1 lần sửa
    // thật (người dùng sửa thủ công luôn mất hơn vài giây để mở form + gõ + submit).
    private static final long EDIT_DETECTION_TOLERANCE_SECONDS = 5;

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
        // Chỉ trả review đang hiển thị (isVisible=true) cho API công khai — review bị admin
        // ẩn vẫn còn trong DB nhưng không lộ ra đây (xem GET /admin/reviews ở Phase 3).
        return reviewRepository
                .findByProduct_IdAndIsVisibleTrueOrderByCreatedAtDesc(productId, pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummaryByProduct(Long productId) {
        // Cùng nguyên tắc như getReviewsByProduct: summary công khai chỉ tính review isVisible=true.
        List<Integer> ratings = reviewRepository.findVisibleRatingsByProductId(productId);

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

    @Override
    @Transactional
    public ReviewResponse updateReview(Long productId, Long reviewId, ReviewUpdateRequest request) {
        User user = currentUserProvider.getCurrentUser()
                .orElseThrow(() -> new InvalidCredentialsException("Bạn cần đăng nhập để sửa đánh giá."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy review."));

        // productId trong URL không khớp review -> coi như không tìm thấy (cùng nguyên tắc như
        // createReview: URL/resource lệch nhau là 404, không phải 400).
        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy review.");
        }

        // Không phải chủ review -> 404 (không lộ việc review tồn tại nhưng thuộc về người khác —
        // xem quyết định đã ghi trong ReviewAccessDeniedException.java / PROGRESS_PHASE_2a).
        if (!review.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Không tìm thấy review.");
        }

        // Review đã bị admin ẩn -> chặn sửa (dùng lại ReviewAccessDeniedException, cùng ngữ nghĩa
        // "được nhận diện đúng, nhưng bị chặn" — quyết định đã ghi ở PROGRESS_PHASE_2a).
        if (Boolean.FALSE.equals(review.getIsVisible())) {
            throw new ReviewAccessDeniedException(
                    "Đánh giá này đã bị quản trị viên ẩn, không thể chỉnh sửa.");
        }

        LocalDateTime now = LocalDateTime.now();

        // Quá 24h kể từ createdAt -> chặn.
        if (review.getCreatedAt().plusHours(EDIT_WINDOW_HOURS).isBefore(now)) {
            throw new ReviewAccessDeniedException(
                    "Đã quá 24 giờ kể từ khi tạo đánh giá, không thể chỉnh sửa.");
        }

        // Đã sửa 1 lần rồi -> chặn. Không dùng "updatedAt != null" (luôn khác null kể cả bản ghi mới
        // vừa tạo) mà so lệch giữa updatedAt và createdAt so với ngưỡng dung sai.
        if (ChronoUnit.SECONDS.between(review.getCreatedAt(), review.getUpdatedAt())
                > EDIT_DETECTION_TOLERANCE_SECONDS) {
            throw new ReviewAccessDeniedException(
                    "Đánh giá này đã được chỉnh sửa trước đó, chỉ được sửa 1 lần.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return reviewMapper.toResponse(saved);
    }
}
