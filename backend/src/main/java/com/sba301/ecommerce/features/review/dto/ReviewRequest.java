package com.sba301.ecommerce.features.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.sba301.ecommerce.features.review.constant.ReviewConstants;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull(message = "orderItemId không được để trống")
    private Long orderItemId;

    @NotNull(message = "rating không được để trống")
    @Min(value = 1, message = "rating tối thiểu là 1")
    @Max(value = 5, message = "rating tối đa là 5")
    private Integer rating;

    @Size(min = ReviewConstants.MIN_COMMENT_LENGTH, max = ReviewConstants.MAX_COMMENT_LENGTH,
            message = "comment phải từ " + ReviewConstants.MIN_COMMENT_LENGTH + " đến "
                    + ReviewConstants.MAX_COMMENT_LENGTH + " ký tự")
    private String comment;
}