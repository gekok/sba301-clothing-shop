package com.sba301.ecommerce.features.order.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemResponse {
    private Long orderItemId;
    private Long productId;
    private String productName;
    private String variantInfo;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
    private boolean reviewed;
}
