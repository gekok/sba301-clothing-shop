package com.sba301.ecommerce.features.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {
    private Long shippingAddressId;
    
    private String note;

    @NotBlank
    private String paymentMethod; // COD or VNPAY

    @NotNull
    private BigDecimal shippingFee;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    public static class OrderItemRequest {
        @NotNull
        private Long variantId;

        @NotNull
        @Min(1)
        private Integer quantity;
    }
}
