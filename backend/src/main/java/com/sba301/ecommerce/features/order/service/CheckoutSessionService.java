package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.cart.repository.CartItemRepository;
import com.sba301.ecommerce.features.entities.*;
import com.sba301.ecommerce.features.order.dto.*;
import com.sba301.ecommerce.features.order.repository.InventoryReservationRepository;
import com.sba301.ecommerce.features.product.repository.ProductVariantRepository;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CheckoutSessionService {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutSessionService.class);

    private final InventoryReservationRepository reservationRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CheckoutSessionService(InventoryReservationRepository reservationRepository,
                                  CartItemRepository cartItemRepository,
                                  ProductVariantRepository variantRepository,
                                  UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
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

    public CheckoutSessionResponse initSession(InitCheckoutSessionRequest request) {
        User user = getCurrentUser();

        // 1. Release any existing reservations for this user to prevent hoarding
        List<InventoryReservation> existing = reservationRepository.findByUserId(user.getId());
        for (InventoryReservation res : existing) {
            ProductVariant variant = res.getVariant();
            variant.setStockQuantity(variant.getStockQuantity() + res.getQuantity());
            variantRepository.save(variant);
        }
        reservationRepository.deleteAll(existing);

        // 2. Create new session
        String sessionId = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        List<CheckoutSessionItemResponse> itemResponses = new ArrayList<>();

        List<CartItem> cartItems = cartItemRepository.findAllById(request.getCartItemIds());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
        }

        for (CartItem cartItem : cartItems) {
            if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Cart item does not belong to user");
            }
            ProductVariant variant = cartItem.getVariant();
            
            // Check stock
            if (cartItem.getQuantity() > variant.getStockQuantity()) {
                throw new BadRequestException("Sản phẩm " + variant.getProduct().getName() + " - " + variant.getColor() + " - Size " + variant.getSize() + " không đủ số lượng trong kho.");
            }

            // Deduct stock temporarily
            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            variantRepository.save(variant);

            // Create reservation
            InventoryReservation res = new InventoryReservation();
            res.setSessionId(sessionId);
            res.setUser(user);
            res.setVariant(variant);
            res.setQuantity(cartItem.getQuantity());
            res.setExpiresAt(expiresAt);
            reservationRepository.save(res);

            // Build response item
            CheckoutSessionItemResponse itemDto = new CheckoutSessionItemResponse();
            itemDto.setVariantId(variant.getId());
            itemDto.setProductId(variant.getProduct().getId());
            itemDto.setProductName(variant.getProduct().getName());
            itemDto.setProductSlug(variant.getProduct().getSlug());
            itemDto.setProductThumbnail(variant.getProduct().getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary())).map(ProductImage::getUrl).findFirst().orElse(null));
            itemDto.setColor(variant.getColor());
            itemDto.setSize(variant.getSize());
            itemDto.setUnitPrice(variant.getPrice());
            itemDto.setQuantity(cartItem.getQuantity());
            itemResponses.add(itemDto);
        }

        CheckoutSessionResponse response = new CheckoutSessionResponse();
        response.setSessionId(sessionId);
        response.setExpiresAt(expiresAt);
        response.setItems(itemResponses);

        return response;
    }

    @Transactional(readOnly = true)
    public CheckoutSessionResponse getSession(String sessionId) {
        User user = getCurrentUser();
        List<InventoryReservation> reservations = reservationRepository.findBySessionId(sessionId);
        
        if (reservations.isEmpty()) {
            throw new ResourceNotFoundException("Phiên thanh toán đã hết hạn hoặc không tồn tại.");
        }

        if (!reservations.get(0).getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied");
        }

        LocalDateTime expiresAt = reservations.get(0).getExpiresAt();
        
        List<CheckoutSessionItemResponse> itemResponses = reservations.stream().map(res -> {
            ProductVariant variant = res.getVariant();
            CheckoutSessionItemResponse itemDto = new CheckoutSessionItemResponse();
            itemDto.setVariantId(variant.getId());
            itemDto.setProductId(variant.getProduct().getId());
            itemDto.setProductName(variant.getProduct().getName());
            itemDto.setProductSlug(variant.getProduct().getSlug());
            itemDto.setProductThumbnail(variant.getProduct().getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary())).map(ProductImage::getUrl).findFirst().orElse(null));
            itemDto.setColor(variant.getColor());
            itemDto.setSize(variant.getSize());
            itemDto.setUnitPrice(variant.getPrice());
            itemDto.setQuantity(res.getQuantity());
            return itemDto;
        }).collect(Collectors.toList());

        CheckoutSessionResponse response = new CheckoutSessionResponse();
        response.setSessionId(sessionId);
        response.setExpiresAt(expiresAt);
        response.setItems(itemResponses);

        return response;
    }
    
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void releaseExpiredReservations() {
        List<InventoryReservation> expired = reservationRepository.findByExpiresAtBefore(LocalDateTime.now());
        if (!expired.isEmpty()) {
            logger.info("Releasing {} expired inventory reservations", expired.size());
            for (InventoryReservation res : expired) {
                ProductVariant variant = res.getVariant();
                variant.setStockQuantity(variant.getStockQuantity() + res.getQuantity());
                variantRepository.save(variant);
                reservationRepository.delete(res);
            }
        }
    }
}
