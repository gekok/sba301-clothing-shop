# GIẢI THÍCH CHI TIẾT FILE CONTROLLER: CartController.java

- **Đường dẫn tương đối:** `backend/src/main/java/com/sba301/ecommerce/features/cart/controller/CartController.java`
- **Chức năng:** Tầng tiếp nhận HTTP Request REST API cho tính năng Giỏ hàng (đường dẫn cơ sở `/carts`).

---

## MÃ NGUỒN VÀ GIẢI THÍCH CHI TIẾT TỪNG DÒNG

```java
package com.sba301.ecommerce.features.cart.controller;

import com.sba301.ecommerce.features.cart.dto.AddCartItemRequest;
import com.sba301.ecommerce.features.cart.dto.CartItemResponse;
import com.sba301.ecommerce.features.cart.dto.CartResponse;
import com.sba301.ecommerce.features.cart.dto.UpdateCartItemRequest;
import com.sba301.ecommerce.features.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Khai báo đây là một REST Controller trả về định dạng JSON
@RequestMapping("/carts") // Đường dẫn tiền tố chung cho các API giỏ hàng
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // API: GET /api/v1/carts/me
    // Chức năng: Lấy thông tin chi tiết giỏ hàng của người dùng đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<CartResponse> getMyCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    // API: POST /api/v1/carts/items
    // Chức năng: Thêm một sản phẩm (variantId + quantity) vào giỏ hàng
    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addItem(@Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(request));
    }

    // API: PUT /api/v1/carts/items/{id}
    // Chức năng: Cập nhật số lượng sản phẩm trong giỏ theo itemId
    @PutMapping("/items/{id}")
    public ResponseEntity<CartItemResponse> updateItemQuantity(
            @PathVariable("id") Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(itemId, request.getQuantity()));
    }

    // API: DELETE /api/v1/carts/items/{id}
    // Chức năng: Xóa một món hàng ra khỏi giỏ
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeItem(@PathVariable("id") Long itemId) {
        cartService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
```
