package com.sba301.ecommerce.features.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// Tên field phải khớp bảng "Sản phẩm" trong modal chi tiết đơn ở FE
// (features/orders/pages/OrderManagement.jsx). Lệch 1 chữ hoa là cột hiện trống.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderItemResponse {
    private Long id;
    private String productName;
    private String variantInfo;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}
