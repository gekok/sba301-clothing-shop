package com.sba301.ecommerce.features.cart.service;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.cart.dto.AddCartItemRequest;
import com.sba301.ecommerce.features.cart.dto.CartItemResponse;
import com.sba301.ecommerce.features.cart.dto.CartResponse;
import com.sba301.ecommerce.features.cart.repository.CartItemRepository;
import com.sba301.ecommerce.features.cart.repository.CartRepository;
import com.sba301.ecommerce.features.entities.Cart;
import com.sba301.ecommerce.features.entities.CartItem;
import com.sba301.ecommerce.features.entities.ProductVariant;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.product.repository.ProductVariantRepository;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository productVariantRepository;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           UserRepository userRepository,
                           ProductVariantRepository productVariantRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productVariantRepository = productVariantRepository;
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof CustomUserDetails) {
            CustomUserDetails details = (CustomUserDetails) principal;
            return userRepository.findById(details.getUser().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new com.sba301.ecommerce.exception.InvalidCredentialsException("User is not authenticated");
    }

    @Override
    public CartResponse getMyCart() {
        User currentUser = getCurrentUser();
        Cart cart = cartRepository.findByUserIdWithItems(currentUser.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(currentUser);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setItems(cart.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList()));
        return response;
    }

    @Override
    public CartItemResponse addItem(AddCartItemRequest request) {
        User currentUser = getCurrentUser();
        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        if (request.getQuantity() > variant.getStockQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }

        Cart cart = cartRepository.findByUserIdWithItems(currentUser.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(currentUser);
                    newCart.setItems(new ArrayList<>());
                    return cartRepository.save(newCart);
                });

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .findFirst();

        CartItem item;
        if (existingItemOpt.isPresent()) {
            item = existingItemOpt.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > variant.getStockQuantity()) {
                throw new BadRequestException("Total quantity exceeds available stock");
            }
            item.setQuantity(newQuantity);
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setVariant(variant);
            item.setQuantity(request.getQuantity());
            cart.getItems().add(item);
        }

        CartItem savedItem = cartItemRepository.save(item);
        return toItemResponse(savedItem);
    }

    @Override
    public CartItemResponse updateItemQuantity(Long itemId, int qty) {
        User currentUser = getCurrentUser();
        CartItem item = cartItemRepository.findByIdWithVariant(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Cart item not found for this user");
        }

        ProductVariant variant = item.getVariant();
        if (qty > variant.getStockQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }

        item.setQuantity(qty);
        CartItem savedItem = cartItemRepository.save(item);
        return toItemResponse(savedItem);
    }

    @Override
    public void removeItem(Long itemId) {
        User currentUser = getCurrentUser();
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getCart().getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Cart item not found for this user");
        }

        cartItemRepository.delete(item);
    }

    private CartItemResponse toItemResponse(CartItem item) {
        CartItemResponse dto = new CartItemResponse();
        dto.setId(item.getId());
        dto.setVariantId(item.getVariant().getId());
        dto.setProductName(item.getVariant().getProduct().getName());
        dto.setVariantInfo(item.getVariant().getSize() + " / " + item.getVariant().getColor());
        dto.setSku(item.getVariant().getSku());
        dto.setUnitPrice(item.getVariant().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setDiscount(BigDecimal.ZERO);
        dto.setStockQuantity(item.getVariant().getStockQuantity());
        return dto;
    }
}
