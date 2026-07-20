package com.sba301.ecommerce.features.product.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageRequest {
    @NotBlank(message = "Image URL is required")
    private String url;

    private Integer displayOrder = 0;

    private Boolean isPrimary = false;
}
