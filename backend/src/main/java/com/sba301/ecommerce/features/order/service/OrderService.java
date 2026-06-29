package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.features.order.dto.CreateOrderRequest;
import com.sba301.ecommerce.features.order.dto.OrderResponse;
import com.sba301.ecommerce.features.order.dto.UpdateOrderStatusRequest;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request);
    List<OrderResponse> listMyOrders();
    OrderResponse getByCode(String orderCode);
    OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request);
}
