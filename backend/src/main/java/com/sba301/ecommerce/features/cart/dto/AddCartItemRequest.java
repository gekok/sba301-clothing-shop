package com.sba301.ecommerce.features.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCartItemRequest {
    @NotNull
    private Long variantId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
