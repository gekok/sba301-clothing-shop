package com.sba301.ecommerce.features.auth.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: @RequiredArgsConstructor inject AuthService.
//   POST /auth/login    @Valid @RequestBody LoginRequest    -> ResponseEntity<AuthResponse> (200)
//   POST /auth/register @Valid @RequestBody RegisterRequest -> ResponseEntity<AuthResponse> (201)
// Resolve -> /api/auth/...  (khớp FE baseURL http://localhost:8080/api)
@RestController
@RequestMapping("/auth")
public class AuthController {
}
