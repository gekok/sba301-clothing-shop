package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.config.VNPayConfig;
import com.sba301.ecommerce.exception.BadRequestException;
import com.sba301.ecommerce.exception.ResourceNotFoundException;
import com.sba301.ecommerce.features.address.repository.AddressRepository;
import com.sba301.ecommerce.features.auth.repositories.UserRepository;
import com.sba301.ecommerce.features.cart.repository.CartRepository;
import com.sba301.ecommerce.features.cart.repository.CartItemRepository;
import com.sba301.ecommerce.features.entities.*;
import com.sba301.ecommerce.features.entities.enums.*;
import com.sba301.ecommerce.features.order.dto.CreateOrderRequest;
import com.sba301.ecommerce.features.order.dto.OrderItemResponse;
import com.sba301.ecommerce.features.order.dto.OrderResponse;
import com.sba301.ecommerce.features.order.repository.OrderRepository;
import com.sba301.ecommerce.features.product.repository.ProductVariantRepository;
import com.sba301.ecommerce.security.user.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            UserRepository userRepository,
                            AddressRepository addressRepository,
                            ProductVariantRepository productVariantRepository,
                            CartRepository cartRepository,
                            CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.productVariantRepository = productVariantRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
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
    public OrderResponse createOrder(CreateOrderRequest request, String clientIp) {
        User currentUser = getCurrentUser();

        Address shippingAddress = null;
        if (request.getShippingAddressId() != null) {
            shippingAddress = addressRepository.findById(request.getShippingAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found"));
            if (!shippingAddress.getUser().getId().equals(currentUser.getId())) {
                throw new BadRequestException("Invalid shipping address for this user");
            }
        }

        // Generate unique order code using UUID prefix to fit in 30 characters
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 15).toUpperCase();
        String orderCode = "ORD-" + uuid;

        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setUser(currentUser);
        order.setChannel(OrderChannel.ONLINE);
        order.setNote(request.getNote());
        order.setShippingAddress(shippingAddress);
        order.setShippingFee(request.getShippingFee());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product variant not found: " + itemReq.getVariantId()));

            if (itemReq.getQuantity() > variant.getStockQuantity()) {
                throw new BadRequestException("Variant " + variant.getSku() + " is out of stock");
            }

            // Deduct stock
            variant.setStockQuantity(variant.getStockQuantity() - itemReq.getQuantity());
            productVariantRepository.save(variant);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setProductName(variant.getProduct().getName());
            orderItem.setVariantInfo(variant.getSize() + " / " + variant.getColor());
            orderItem.setUnitPrice(variant.getPrice());
            orderItem.setQuantity(itemReq.getQuantity());
            BigDecimal itemSubtotal = variant.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            orderItem.setSubtotal(itemSubtotal);
            orderItems.add(orderItem);

            subtotal = subtotal.add(itemSubtotal);
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(request.getShippingFee()));
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(OrderPaymentStatus.UNPAID);

        // Save order and items
        Order savedOrder = orderRepository.save(order);

        // Create Payment record
        Payment payment = new Payment();
        payment.setOrder(savedOrder);
        payment.setAmount(savedOrder.getTotalAmount());
        payment.setMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setStatus(PaymentTxnStatus.PENDING);
        savedOrder.getPayments().add(payment);
        orderRepository.save(savedOrder);

        // Clean purchased items from user's cart
        Optional<Cart> cartOpt = cartRepository.findByUserIdWithItems(currentUser.getId());
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            Set<Long> purchasedVariantIds = request.getItems().stream()
                    .map(CreateOrderRequest.OrderItemRequest::getVariantId)
                    .collect(Collectors.toSet());

            List<CartItem> itemsToRemove = cart.getItems().stream()
                    .filter(item -> purchasedVariantIds.contains(item.getVariant().getId()))
                    .collect(Collectors.toList());

            for (CartItem item : itemsToRemove) {
                cart.getItems().remove(item);
                cartItemRepository.delete(item);
            }
            cartRepository.save(cart);
        }

        OrderResponse response = toOrderResponse(savedOrder);

        // Generate VNPAY payment url if VNPAY method is selected
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            // Amount in VNPAY is multiplied by 100
            String amountCents = savedOrder.getTotalAmount().multiply(new BigDecimal(100)).setScale(0).toString();
            String paymentUrl = VNPayConfig.getPaymentUrl(orderCode, amountCents, clientIp);
            response.setPaymentUrl(paymentUrl);
        }

        return response;
    }

    @Override
    public OrderResponse handleVNPayCallback(Map<String, String> vnpParams) {
        String secureHash = vnpParams.get("vnp_SecureHash");
        if (secureHash == null || !VNPayConfig.verifySignature(vnpParams, secureHash)) {
            throw new BadRequestException("Invalid payment signature");
        }

        String orderCode = vnpParams.get("vnp_TxnRef");
        Order order = orderRepository.findByOrderCodeWithItems(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with code: " + orderCode));

        // Retrieve the corresponding payment
        Payment payment = order.getPayments().stream()
                .filter(p -> p.getMethod() == PaymentMethod.VNPAY)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for VNPAY"));

        if (payment.getStatus() != PaymentTxnStatus.PENDING) {
            return toOrderResponse(order); // Already processed
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String transactionNo = vnpParams.get("vnp_TransactionNo");

        if ("00".equals(responseCode)) {
            order.setStatus(OrderStatus.CONFIRMED);
            order.setPaymentStatus(OrderPaymentStatus.PAID);

            payment.setStatus(PaymentTxnStatus.SUCCESS);
            payment.setTransactionRef(transactionNo);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            // Failed payment -> Cancel order and restore stock
            order.setStatus(OrderStatus.CANCELLED);
            order.setPaymentStatus(OrderPaymentStatus.UNPAID);

            payment.setStatus(PaymentTxnStatus.FAILED);
            payment.setTransactionRef(transactionNo);

            // Restore variant stocks
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getVariant();
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        Order saved = orderRepository.save(order);
        return toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> listMyOrders() {
        User currentUser = getCurrentUser();
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return orders.stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getByCode(String orderCode) {
        User currentUser = getCurrentUser();
        Order order = orderRepository.findByOrderCodeWithItems(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with code: " + orderCode));

        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Order not found for this user");
        }

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
        response.setItems(order.getItems().stream()
                .map(item -> {
                    OrderItemResponse itemDto = new OrderItemResponse();
                    itemDto.setProductName(item.getProductName());
                    itemDto.setVariantInfo(item.getVariantInfo());
                    itemDto.setUnitPrice(item.getUnitPrice());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setSubtotal(item.getSubtotal());
                    return itemDto;
                })
                .collect(Collectors.toList()));
        return response;
    }
}
