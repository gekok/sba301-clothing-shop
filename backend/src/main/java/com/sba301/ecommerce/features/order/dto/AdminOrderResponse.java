package com.sba301.ecommerce.features.order.dto;

import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderPaymentStatus;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// DTO riêng cho màn hình quản trị, KHÔNG dùng chung OrderResponse của luồng khách hàng.
// Lý do: màn admin cần thêm id / tên khách / nhân viên tạo đơn / ngày tạo, mà nhét
// những field đó vào OrderResponse thì đơn của chính khách cũng bị trả kèm - vừa thừa vừa lộ dữ liệu.
// Đổi lại: 2 DTO hơi giống nhau, chấp nhận để 2 luồng tiến hoá độc lập, không dẫm chân nhau.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderResponse {
    private Long id;
    private String orderCode;
    private String customerName;        // lấy từ user.fullName
    private OrderStatus status;
    private OrderPaymentStatus paymentStatus;
    private OrderChannel channel;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String note;
    private String createdByStaffName;  // null nếu khách tự đặt online
    private LocalDateTime createdAt;
    private List<AdminOrderItemResponse> items;
}
