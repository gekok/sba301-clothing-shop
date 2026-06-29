package com.sba301.ecommerce.features.cart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressDto {
    private Long id;
    private String recipientName;
    private String phone;
    private String province;
    private String district;
    private String ward;
    private String street;
    private Boolean isDefault;
}
