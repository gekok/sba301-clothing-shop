package com.sba301.ecommerce.features.order.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: @RequiredArgsConstructor inject OrderService.
//   POST /orders                 @Valid CreateOrderRequest -> OrderResponse (checkout)
//   GET  /orders/me              -> List<OrderResponse> (don cua user hien tai)
//   GET  /orders/{orderCode}     -> OrderResponse (ownership)
//   PUT  /orders/{id}/status     @Valid UpdateOrderStatusRequest (hasAnyRole ADMIN,STAFF)
import com.sba301.ecommerce.features.order.dto.CreateOrderRequest;
import com.sba301.ecommerce.features.order.dto.OrderResponse;
import com.sba301.ecommerce.features.order.dto.UpdateOrderStatusRequest;
import com.sba301.ecommerce.features.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> listMyOrders() {
        return ResponseEntity.ok(orderService.listMyOrders());
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<OrderResponse> getByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(orderService.getByCode(orderCode));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }
}
