package com.sba301.ecommerce.features.order.service;

import org.springframework.stereotype.Service;

// TODO: implements OrderService. @RequiredArgsConstructor deps: OrderRepository, UserRepository (+ Cart/Variant repo neu build tu cart).
//   createOrder: build OrderItem tu request/cart, tinh subtotal/total, gen orderCode, status=PENDING, paymentStatus=UNPAID.
//     (KHONG xu ly Payment - feature defer. shippingAddressId nullable - Address defer.)
//   getByCode/listMyOrders: ownership theo user hien tai. updateStatus: staff/admin.
import com.sba301.ecommerce.features.entities.*;
import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderPaymentStatus;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.entities.enums.PaymentMethod;
import com.sba301.ecommerce.features.entities.enums.PaymentTxnStatus;
import com.sba301.ecommerce.features.order.dto.CreateOrderRequest;
import com.sba301.ecommerce.features.order.dto.OrderItemResponse;
import com.sba301.ecommerce.features.order.dto.OrderResponse;
import com.sba301.ecommerce.features.order.dto.UpdateOrderStatusRequest;
import com.sba301.ecommerce.features.order.repository.OrderRepository;
import com.sba301.ecommerce.features.order.repository.PaymentRepository;
import com.sba301.ecommerce.features.product.repository.ProductVariantRepository;
import com.sba301.ecommerce.features.cart.repository.CartRepository;
import com.sba301.ecommerce.features.cart.repository.CartItemRepository;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final PaymentRepository paymentRepository;
    private final com.sba301.ecommerce.features.auth.repositories.UserRepository userRepository;

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
    public OrderResponse createOrder(CreateOrderRequest request) {
        User user = getCurrentUser();

        Order order = new Order();
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(user);
        order.setChannel(OrderChannel.ONLINE);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(OrderPaymentStatus.UNPAID);
        order.setNote(request.getNote());
        
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.Item requestItem : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(requestItem.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found: " + requestItem.getVariantId()));

            if (variant.getStockQuantity() < requestItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for variant: " + variant.getSku());
            }

            variant.setStockQuantity(variant.getStockQuantity() - requestItem.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setProductName(variant.getProduct().getName());
            orderItem.setVariantInfo(variant.getSize() + " / " + variant.getColor());
            orderItem.setUnitPrice(variant.getPrice());
            orderItem.setQuantity(requestItem.getQuantity());
            orderItem.setSubtotal(variant.getPrice().multiply(new BigDecimal(requestItem.getQuantity())));

            totalSubtotal = totalSubtotal.add(orderItem.getSubtotal());
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        order.setSubtotal(totalSubtotal);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTotalAmount(totalSubtotal.add(order.getShippingFee()));

        Order savedOrder = orderRepository.save(order);

        // Delete ordered items from cart
        cartRepository.findByUserIdWithItems(user.getId()).ifPresent(cart -> {
            List<Long> variantIdsOrdered = request.getItems().stream()
                    .map(CreateOrderRequest.Item::getVariantId)
                    .collect(Collectors.toList());
            
            List<CartItem> itemsToRemove = cart.getItems().stream()
                    .filter(item -> variantIdsOrdered.contains(item.getVariant().getId()))
                    .collect(Collectors.toList());
            
            cartItemRepository.deleteAll(itemsToRemove);
        });

        // Create Payment record
        if (request.getPaymentMethod() != null) {
            Payment payment = new Payment();
            payment.setOrder(savedOrder);
            try {
                payment.setMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
            } catch (Exception e) {
                payment.setMethod(PaymentMethod.COD); // fallback
            }
            payment.setAmount(savedOrder.getTotalAmount());
            payment.setStatus(PaymentTxnStatus.PENDING);
            paymentRepository.save(payment);
        }

        return toOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listMyOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserId(user.getId()).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        User user = getCurrentUser();
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not your order");
        }
        
        return toOrderResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(request.getStatus());
        return toOrderResponse(order);
    }

    private OrderResponse toOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderCode(order.getOrderCode());
        response.setStatus(order.getStatus().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setChannel(order.getChannel().name());
        response.setSubtotal(order.getSubtotal());
        response.setShippingFee(order.getShippingFee());
        response.setTotalAmount(order.getTotalAmount());
        response.setNote(order.getNote());

        if (order.getItems() != null) {
            response.setItems(order.getItems().stream().map(item -> {
                OrderItemResponse ir = new OrderItemResponse();
                ir.setProductName(item.getProductName());
                ir.setVariantInfo(item.getVariantInfo());
                ir.setUnitPrice(item.getUnitPrice());
                ir.setQuantity(item.getQuantity());
                ir.setSubtotal(item.getSubtotal());
                return ir;
            }).collect(Collectors.toList()));
        } else {
            response.setItems(List.of());
        }
        
        return response;
    }
}
