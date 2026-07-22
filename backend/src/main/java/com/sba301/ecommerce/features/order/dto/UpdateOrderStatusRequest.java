package com.sba301.ecommerce.features.order.dto;

import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    // Chuỗi lạ (vd "ABC") sẽ bị Jackson chặn ngay khi ghép JSON -> 400.
    // @NotNull lo trường hợp client gửi thiếu hẳn field hoặc gửi null.
    @NotNull(message = "Trạng thái mới không được để trống")
    private OrderStatus status;
}
