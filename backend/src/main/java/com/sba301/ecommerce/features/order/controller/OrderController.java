package com.sba301.ecommerce.features.order.controller;

import com.sba301.ecommerce.features.order.dto.CreateOrderRequest;
import com.sba301.ecommerce.features.order.dto.OrderResponse;
import com.sba301.ecommerce.features.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest createOrderRequest,
            HttpServletRequest request) {
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        return ResponseEntity.ok(orderService.createOrder(createOrderRequest, ip));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<OrderResponse> handleVNPayCallback(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(orderService.handleVNPayCallback(params));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> listMyOrders() {
        return ResponseEntity.ok(orderService.listMyOrders());
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<OrderResponse> getByCode(@PathVariable("orderCode") String orderCode) {
        return ResponseEntity.ok(orderService.getByCode(orderCode));
    }
}
