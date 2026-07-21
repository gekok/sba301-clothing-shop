package com.sba301.ecommerce.features.pos.controller;

import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import com.sba301.ecommerce.features.pos.dto.CreatePosOrderRequest;
import com.sba301.ecommerce.features.pos.dto.PosVariantResponse;
import com.sba301.ecommerce.features.pos.service.PosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Đường dẫn đầy đủ: /api/v1/pos/...
@RestController
@RequestMapping("/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    // Lưới chọn hàng của nhân viên bán tại quầy.
    @GetMapping("/variants")
    public ResponseEntity<List<PosVariantResponse>> searchVariants(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(posService.searchVariants(keyword));
    }

    // Bấm "Thanh toán" ở quầy. Trả về đơn vừa tạo để in hoá đơn.
    @PostMapping("/orders")
    public ResponseEntity<AdminOrderResponse> createOrder(
            @Valid @RequestBody CreatePosOrderRequest request) {
        return ResponseEntity.ok(posService.createOrder(request));
    }
}
