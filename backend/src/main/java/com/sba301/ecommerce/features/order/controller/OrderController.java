package com.sba301.ecommerce.features.order.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: @RequiredArgsConstructor inject OrderService.
//   POST /orders                 @Valid CreateOrderRequest -> OrderResponse (checkout)
//   GET  /orders/me              -> List<OrderResponse> (don cua user hien tai)
//   GET  /orders/{orderCode}     -> OrderResponse (ownership)
//   PUT  /orders/{id}/status     @Valid UpdateOrderStatusRequest (hasAnyRole ADMIN,STAFF)
@RestController
@RequestMapping("/orders")
public class OrderController {
}
