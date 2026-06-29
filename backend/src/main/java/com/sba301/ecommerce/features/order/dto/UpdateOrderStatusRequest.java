package com.sba301.ecommerce.features.order.dto;

import com.sba301.ecommerce.features.entities.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {
    @NotNull(message = "Status cannot be null")
    private OrderStatus status;
}
