package com.sba301.ecommerce.features.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

// 1 dòng trong lưới chọn hàng của màn POS. Đơn vị bán là BIẾN THỂ (size/màu cụ thể)
// chứ không phải sản phẩm, vì tồn kho và giá gắn với biến thể.
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PosVariantResponse {
    private Long id;              // id của ProductVariant - chính là variantId khi gửi đơn
    private String sku;
    private String productName;
    private String size;
    private String color;
    private BigDecimal price;
    private Integer stockQuantity;
}
