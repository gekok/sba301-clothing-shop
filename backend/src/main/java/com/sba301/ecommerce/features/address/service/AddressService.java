package com.sba301.ecommerce.features.address.service;

import com.sba301.ecommerce.features.cart.dto.AddressDto;
import java.util.List;

public interface AddressService {
    List<AddressDto> getMyAddresses();
    AddressDto addAddress(AddressDto addressDto);
}
