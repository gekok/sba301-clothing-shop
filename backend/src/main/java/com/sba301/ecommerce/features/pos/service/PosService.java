package com.sba301.ecommerce.features.pos.service;

import com.sba301.ecommerce.features.order.dto.AdminOrderResponse;
import com.sba301.ecommerce.features.pos.dto.CreatePosOrderRequest;
import com.sba301.ecommerce.features.pos.dto.PosVariantResponse;

import java.util.List;

public interface PosService {

    // keyword null/rỗng = trả hết hàng đang bán.
    List<PosVariantResponse> searchVariants(String keyword);

    // Trả về đơn vừa tạo để màn POS in hoá đơn. Dùng chung AdminOrderResponse với màn
    // quản lý đơn: cùng là 1 đơn hàng, không việc gì phải đẻ thêm DTO gần y hệt.
    AdminOrderResponse createOrder(CreatePosOrderRequest request);
}
