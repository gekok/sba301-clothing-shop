package com.sba301.ecommerce.features.cart.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: @RequiredArgsConstructor inject CartService. (Bảo vệ bởi hasRole CUSTOMER trong SecurityConfig.)
//   GET    /carts/me            -> ResponseEntity<CartResponse>   (FE đọc .items)
//   PUT    /carts/items/{id}    @Valid @RequestBody UpdateCartItemRequest -> ResponseEntity<CartItemResponse>
//   DELETE /carts/items/{id}    -> ResponseEntity<Void> (204)
import com.sba301.ecommerce.features.cart.dto.CartItemResponse;
import com.sba301.ecommerce.features.cart.dto.CartResponse;
import com.sba301.ecommerce.features.cart.dto.UpdateCartItemRequest;
import com.sba301.ecommerce.features.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/me")
    public ResponseEntity<CartResponse> getMyCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartItemResponse> updateItemQuantity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(id, request.getQuantity()));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ResponseEntity.noContent().build();
    }
}
