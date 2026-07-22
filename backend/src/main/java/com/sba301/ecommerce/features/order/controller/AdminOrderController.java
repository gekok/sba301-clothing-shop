package com.sba301.ecommerce.features.order.controller;

import com.sba301.ecommerce.features.entities.enums.OrderChannel;
import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import com.sba301.ecommerce.features.order.dto.UpdateOrderStatusRequest;
import com.sba301.ecommerce.features.order.service.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Đường dẫn đầy đủ: /api/v1/admin/orders
// Tách khỏi OrderController (đang phục vụ luồng khách: giỏ hàng, VNPay, "đơn của tôi")
// để 2 nhóm chức năng khác quyền hạn không nằm chung 1 file.
@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    // Spring tự đổi chuỗi "PENDING" thành enum OrderStatus. FE chọn "Tất cả" thì
    // không gửi tham số lên, các field này nhận null = bỏ qua tiêu chí lọc đó.
    @GetMapping
    public ResponseEntity<List<AdminOrderResponse>> search(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderChannel channel,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(adminOrderService.search(status, channel, keyword));
    }

    // @Valid kích hoạt @NotNull trong UpdateOrderStatusRequest -> thiếu status là 400,
    // không lọt xuống service.
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminOrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(adminOrderService.updateStatus(id, request));
    }
}
