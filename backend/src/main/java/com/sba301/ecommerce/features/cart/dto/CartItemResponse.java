package com.sba301.ecommerce.features.cart.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private String productName;
    private String variantInfo;
    private String sku;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal discount = BigDecimal.ZERO;
    private Integer stockQuantity;
}
