package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.features.order.dto.CreateOrderRequest;
import com.sba301.ecommerce.features.order.dto.OrderResponse;
import java.util.List;
import java.util.Map;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, String clientIp);
    OrderResponse handleVNPayCallback(Map<String, String> vnpParams);
    List<OrderResponse> listMyOrders();
    OrderResponse getByCode(String orderCode);
}
