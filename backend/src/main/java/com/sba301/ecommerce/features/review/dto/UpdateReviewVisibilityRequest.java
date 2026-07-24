package com.sba301.ecommerce.features.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewVisibilityRequest {
    @NotNull(message = "isVisible không được để trống")
    private Boolean isVisible;
}