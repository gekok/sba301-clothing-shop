package com.sba301.ecommerce.features.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long productId;
    private Long userId;
    private String authorName;
    private Long orderItemId;
    private Integer rating;
    private String comment;
    private String createdAt;
    private String updatedAt;
    private Boolean isVisible;
}