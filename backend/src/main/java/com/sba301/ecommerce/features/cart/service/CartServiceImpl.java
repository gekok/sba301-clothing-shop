package com.sba301.ecommerce.features.cart.service;

import org.springframework.stereotype.Service;

// TODO: implements CartService. @RequiredArgsConstructor deps: CartRepository, CartItemRepository, UserRepository.
//   Lấy user hiện tại từ SecurityContext -> CustomUserDetails.getUser().getId().
//   getMyCart(): @Transactional READ-WRITE (get-or-create -> có INSERT, readOnly sẽ rollback). Map entity->DTO TRONG tx.
//   updateItemQuantity: fetch-join; ownership check (item.cart.user.id == current, không thì 404); stock check (qty>stock -> BadRequest); set qty.
//   removeItem: ownership check -> delete.
import com.sba301.ecommerce.features.cart.dto.CartItemResponse;
import com.sba301.ecommerce.features.cart.dto.CartResponse;
import com.sba301.ecommerce.features.cart.repository.CartItemRepository;
import com.sba301.ecommerce.features.cart.repository.CartRepository;
import com.sba301.ecommerce.features.entities.Cart;
import com.sba301.ecommerce.features.entities.CartItem;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        // MOCK USER for testing (since JWT Auth is not fully active yet)
        return userRepository.findById(1L).orElseThrow(() -> new RuntimeException("Mock user not found"));
        /*
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUser();
        }
        throw new RuntimeException("User not authenticated");
        */
    }

    @Override
    @Transactional
    public CartResponse getMyCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
        return toCartResponse(cart);
    }

    @Override
    @Transactional
    public CartItemResponse updateItemQuantity(Long itemId, Integer qty) {
        User user = getCurrentUser();
        CartItem item = cartItemRepository.findByIdWithVariant(itemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));
        
        if (!item.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not your cart item");
        }
        
        if (qty > item.getVariant().getStockQuantity()) {
            throw new RuntimeException("Not enough stock");
        }
        
        item.setQuantity(qty);
        return toCartItemResponse(item);
    }

    @Override
    @Transactional
    public void removeItem(Long itemId) {
        User user = getCurrentUser();
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));
                
        if (!item.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not your cart item");
        }
        
        cartItemRepository.delete(item);
    }

    private CartResponse toCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        if (cart.getItems() != null) {
            List<CartItemResponse> items = cart.getItems().stream()
                    .map(this::toCartItemResponse)
                    .collect(Collectors.toList());
            response.setItems(items);
        } else {
            response.setItems(List.of());
        }
        
        if (cart.getUser() != null && cart.getUser().getAddresses() != null) {
            List<com.sba301.ecommerce.features.cart.dto.AddressDto> addressDtos = cart.getUser().getAddresses().stream()
                    .map(addr -> {
                        com.sba301.ecommerce.features.cart.dto.AddressDto dto = new com.sba301.ecommerce.features.cart.dto.AddressDto();
                        dto.setId(addr.getId());
                        dto.setRecipientName(addr.getRecipientName());
                        dto.setPhone(addr.getPhone());
                        dto.setProvince(addr.getProvince());
                        dto.setDistrict(addr.getDistrict());
                        dto.setWard(addr.getWard());
                        dto.setStreet(addr.getStreet());
                        dto.setIsDefault(addr.getIsDefault());
                        return dto;
                    }).collect(Collectors.toList());
            response.setAddresses(addressDtos);
        } else {
            response.setAddresses(List.of());
        }
        return response;
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setId(item.getId());
        response.setVariantId(item.getVariant().getId());
        response.setProductId(item.getVariant().getProduct().getId());
        response.setProductName(item.getVariant().getProduct().getName());
        response.setVariantInfo(item.getVariant().getSize() + " / " + item.getVariant().getColor());
        response.setSku(item.getVariant().getSku());
        response.setUnitPrice(item.getVariant().getPrice());
        response.setQuantity(item.getQuantity());
        response.setStockQuantity(item.getVariant().getStockQuantity());
        
        // Find primary image
        String thumbnail = item.getVariant().getProduct().getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .map(com.sba301.ecommerce.features.entities.ProductImage::getUrl)
                .findFirst()
                .orElse(null);
        response.setThumbnail(thumbnail);
        
        return response;
    }
}
