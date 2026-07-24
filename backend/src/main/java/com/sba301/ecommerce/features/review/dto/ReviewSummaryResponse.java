package com.sba301.ecommerce.features.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewSummaryResponse {
    private Long productId;
    private Double averageRating;
    private Long totalReviews;
    private Map<Integer, Long> breakdown;
}