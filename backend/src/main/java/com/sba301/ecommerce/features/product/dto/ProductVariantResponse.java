package com.sba301.ecommerce.features.product.dto;

// TODO: id, sku, size, color, price, stockQuantity.
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

// TODO: id, sku, size, color, price, stockQuantity.
@Getter
@Setter
public class ProductVariantResponse {
    private Long id;

    private String sku;

    private String size;

    private String color;

    private BigDecimal price;

    private Integer stockQuantity;

    private Boolean isActive;
}
