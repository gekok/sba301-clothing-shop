package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import com.sba301.ecommerce.features.order.dto.UpdateOrderStatusRequest;

import java.util.List;

public interface AdminOrderService {

    // Mọi tham số lọc đều cho phép null = không lọc theo tiêu chí đó.
    List<AdminOrderResponse> search(OrderStatus status, OrderChannel channel, String keyword);

    AdminOrderResponse updateStatus(Long id, UpdateOrderStatusRequest request);
}
