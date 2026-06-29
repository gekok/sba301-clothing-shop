package com.sba301.ecommerce.features.order.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OrderResponse {
    private String orderCode;
    private String status;
    private String paymentStatus;
    private String channel;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String note;
    private List<OrderItemResponse> items;
}
