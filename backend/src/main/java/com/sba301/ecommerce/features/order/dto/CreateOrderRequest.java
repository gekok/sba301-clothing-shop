package com.sba301.ecommerce.features.order.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {
    private Long shippingAddressId; // nullable - Address feature defer
    private String note;
    private String paymentMethod; // VNPAY, MOMO, COD...

    @NotEmpty
    private List<Item> items;

    @Getter
    @Setter
    public static class Item {
        @NotNull
        private Long variantId;
        
        @NotNull
        private Integer quantity;
    }
}
