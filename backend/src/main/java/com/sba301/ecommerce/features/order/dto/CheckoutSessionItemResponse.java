package com.sba301.ecommerce.features.order.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckoutSessionItemResponse {
    private Long variantId;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productThumbnail;
    private String color;
    private String size;
    private BigDecimal unitPrice;
    private Integer quantity;
}
