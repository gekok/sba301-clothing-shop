package com.sba301.ecommerce.features.order.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CheckoutSessionResponse {
    private String sessionId;
    private LocalDateTime expiresAt;
    private List<CheckoutSessionItemResponse> items;
}
