package com.sba301.ecommerce.features.cart.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private List<AddressDto> addresses;
}
