package com.sba301.ecommerce.features.order.service;

import com.sba301.ecommerce.features.entities.Order;
import com.sba301.ecommerce.features.entities.OrderItem;
import com.sba301.ecommerce.features.entities.User;
import com.sba301.ecommerce.features.order.dto.AdminOrderItemResponse;
import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import org.springframework.stereotype.Component;

// Đổi Order (entity) -> AdminOrderResponse (DTO).
// Tách riêng vì có 2 nơi cần đúng cách map này: AdminOrderServiceImpl (danh sách + đổi
// trạng thái) và PosServiceImpl (trả hoá đơn vừa tạo). Sửa 1 field thì cả 2 màn hình
// cùng đổi theo, không sợ lệch nhau.
//
// LƯU Ý: chỉ được gọi bên trong transaction. Vì open-in-view=false nên các quan hệ lazy
// (user, createdByStaff, items, variant) chỉ nạp được khi session còn mở.
@Component
public class AdminOrderMapper {

    public AdminOrderResponse toResponse(Order order) {
        User customer = order.getUser();
        User staff = order.getCreatedByStaff();
        return AdminOrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerName(customer != null ? customer.getFullName() : null)
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .channel(order.getChannel())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .createdByStaffName(staff != null ? staff.getFullName() : null)
                .createdAt(order.getCreatedAt())
                .items(order.getItems().stream().map(this::toItemResponse).toList())
                .build();
    }

    public AdminOrderItemResponse toItemResponse(OrderItem item) {
        return AdminOrderItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .variantInfo(item.getVariantInfo())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .build();
    }
}
