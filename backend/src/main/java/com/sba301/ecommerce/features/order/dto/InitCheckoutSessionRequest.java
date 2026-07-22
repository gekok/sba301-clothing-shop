package com.sba301.ecommerce.features.order.dto;

import lombok.Data;

import java.util.List;

@Data
public class InitCheckoutSessionRequest {
    private List<Long> cartItemIds;
}
