package com.sba301.ecommerce.features.product.dto;

// TODO: create/update (admin/staff): name, slug, description, brand, basePrice, categoryId, status + jakarta validation.
import com.sba301.ecommerce.features.entities.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {
    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Slug is required")
    private String slug;

    private String description;

    private String brand;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    @NotNull(message = "Status is required")
    private ProductStatus status;
}
