package com.sba301.ecommerce.features.cart.service;

import com.sba301.ecommerce.features.cart.dto.CartItemResponse;
import com.sba301.ecommerce.features.cart.dto.CartResponse;

public interface CartService {
    CartResponse getMyCart();
    CartItemResponse updateItemQuantity(Long itemId, Integer qty);
    void removeItem(Long itemId);
}
