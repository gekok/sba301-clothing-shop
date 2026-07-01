package com.sba301.ecommerce.features.cart.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: @RequiredArgsConstructor inject CartService. (Bảo vệ bởi hasRole CUSTOMER trong SecurityConfig.)
//   GET    /carts/me            -> ResponseEntity<CartResponse>   (FE đọc .items)
//   PUT    /carts/items/{id}    @Valid @RequestBody UpdateCartItemRequest -> ResponseEntity<CartItemResponse>
//   DELETE /carts/items/{id}    -> ResponseEntity<Void> (204)
@RestController
@RequestMapping("/carts")
public class CartController {
}
