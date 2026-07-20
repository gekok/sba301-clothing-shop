package com.sba301.ecommerce.features.product.dto;

import lombok.Getter;
import lombok.Setter;

// TODO: url, isPrimary, displayOrder.
@Getter
@Setter
public class ProductImageResponse {
    private Long id;

    private String url;

    private Integer displayOrder;

    private Boolean isPrimary;
}
