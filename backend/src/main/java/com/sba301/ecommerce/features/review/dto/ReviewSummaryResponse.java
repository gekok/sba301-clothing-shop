package com.sba301.ecommerce.features.review.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
