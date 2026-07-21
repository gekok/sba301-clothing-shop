package com.sba301.ecommerce.features.order.controller;

import com.sba301.ecommerce.features.order.dto.CheckoutSessionResponse;
import com.sba301.ecommerce.features.order.dto.InitCheckoutSessionRequest;
import com.sba301.ecommerce.features.order.service.CheckoutSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkout/session")
public class CheckoutSessionController {

    private final CheckoutSessionService checkoutSessionService;

    public CheckoutSessionController(CheckoutSessionService checkoutSessionService) {
        this.checkoutSessionService = checkoutSessionService;
    }

    @PostMapping("/init")
    public ResponseEntity<CheckoutSessionResponse> initSession(@RequestBody InitCheckoutSessionRequest request) {
        CheckoutSessionResponse response = checkoutSessionService.initSession(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<CheckoutSessionResponse> getSession(@PathVariable String sessionId) {
        CheckoutSessionResponse response = checkoutSessionService.getSession(sessionId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> cancelSession(@PathVariable String sessionId) {
        checkoutSessionService.cancelSession(sessionId);
        return ResponseEntity.ok().build();
    }
}
