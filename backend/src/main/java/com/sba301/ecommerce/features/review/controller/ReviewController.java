package com.sba301.ecommerce.features.review.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sba301.ecommerce.features.review.dto.ReviewRequest;
import com.sba301.ecommerce.features.review.dto.ReviewResponse;
import com.sba301.ecommerce.features.review.dto.ReviewSummaryResponse;
import com.sba301.ecommerce.features.review.service.ReviewService;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Đánh giá sản phẩm")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Lấy danh sách review của 1 product (phân trang)")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @PathVariable Long productId,
            // Không set sort ở đây: findByProduct_IdOrderByCreatedAtDesc bên repository
            // đã tự quy định ORDER BY created_at DESC rồi — set thêm sort=createdAt ở
            // Pageable làm SQL Server nhận created_at 2 lần trong ORDER BY -> lỗi 500
            // "column has been specified more than once in the order by list".
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId, pageable));
    }

    @GetMapping("/summary")
    @Operation(summary = "Lấy tổng hợp đánh giá (avg rating + breakdown) của 1 product")
    public ResponseEntity<ReviewSummaryResponse> getSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getSummaryByProduct(productId));
    }

    @PostMapping
    @Operation(summary = "Tạo review mới — yêu cầu user đã mua (orderItem ở đơn DELIVERED/COMPLETED)")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody ReviewRequest request,
            @PathVariable Long productId) {
        ReviewResponse response = reviewService.createReview(request, productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
