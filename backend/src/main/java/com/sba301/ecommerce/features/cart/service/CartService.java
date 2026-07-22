package com.sba301.ecommerce.features.cart.service;

import com.sba301.ecommerce.features.cart.dto.AddCartItemRequest;
import com.sba301.ecommerce.features.cart.dto.CartItemResponse;
import com.sba301.ecommerce.features.cart.dto.CartResponse;

public interface CartService {
    CartResponse getMyCart();
    CartItemResponse addItem(AddCartItemRequest request);
    CartItemResponse updateItemQuantity(Long itemId, int qty);
    void removeItem(Long itemId);
}
